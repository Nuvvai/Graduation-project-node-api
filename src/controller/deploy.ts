import { Request, Response, NextFunction } from 'express';
import GenerateDockerFile from './../utils/generateDockerfile';
import User, { IUser } from '../models/User';
import OrgGitHubService from './../utils/OrgGitHubService';
// import UserGitHubService from '../utils/UserGitHubService';
import { createProjectService } from '../services/projectService';
import { createPipelineService, triggerBuildService } from '../services/pipelineService';
import { createDeploymentService } from '../services/deploymentService';
import k8sManifestGenerator from '../utils/generatek8sManifestFiles';
import UserGitHubService from './../utils/UserGitHubService';

/**
 * Deploys a project by generating a Dockerfile, setting up a GitHub repository, 
 * and responding with the deployment status.
 *
 * @param req - The HTTP request object containing parameters, user information, and body data.
 * @param res - The HTTP response object used to send the response back to the client.
 * @param next - The next middleware function in the Express.js stack.
 * 
 * @throws Will pass any errors encountered during the deployment process to the next middleware.
 * 
 * The function performs the following steps:
 * 1. Creates a project by calling the createProject controller
 * 2. Creates a Dockerfile and a Kubernetes manifest file.
 * 3. Sets up a GitHub repository with the generated Dockerfile and kubernetes manifest file using the `OrgGitHubService`.
 * 4. Generates a repository token and creates a webhook.
 * 5. Creates deployment and pipeline configurations
 * 6. Triggers a build for the project using the `triggerBuild` function.
 * 7. Sends a success response if the repository is set up successfully, or an error response otherwise.
 */
export const deployProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username } = req.user as IUser;
    const body = req.body;
    const projectName = body.inputsObject.projectName;
    body.containerPort = body.inputObject?.port || '80'; // Default to port 80 if not provided
    const generateDockerFile = new GenerateDockerFile(req, res, username);
    const orgGitHubService = new OrgGitHubService('Nuvvai');
    const k8sGenerator = new k8sManifestGenerator(req, res, username);

    const user = await User.findOne<IUser>({ username });
    if (!user?.github) {
        res.status(404).json({ message: 'User not found!' });
        return;
    }
    const userGitHubService = new UserGitHubService(user?.github?.username, user?.github?.accessToken);

    // Check if the repo name is provided
    if (!body.repoName) {
        res.status(400).json({ message: 'Repository name is required!' });
        return;
    }

    try {
        //Step1: Create a project
        const project = await createProjectService({
            projectName,
            username,
            repositoryUrl: body.repositoryUrl || await userGitHubService.getRepoUrl(body.repoName),
            technology: body.technology,
            description: body.description || ''
        }, username);

        if (!project.success) {
            res.status(project.statusCode).json({ message: project.message });
            return;
        }

        //Step2: Create a Dockerfile and Kubernetes manifest
        const [DockerFile, k8sManifest] = await Promise.all([
            generateDockerFile.technologyPath(body.technology, body.webServer || 'nginx'),
            k8sGenerator.generateK8sManifest()
        ]);

        if (!DockerFile) {
            res.status(400).json({ message: 'Failed to generate Dockerfile' });
            return;
        }
        if (!k8sManifest) {
            res.status(400).json({ message: 'Failed to generate Kubernetes manifest' });
            return;
        }

        const files = [{
            path: 'Dockerfile',
            content: DockerFile
        }, {
            path: 'k8s-manifest.yaml',
            content: k8sManifest
        }
        ]


        //Step3: Set up GitHub repository with files
        const orgRepoUrl = await orgGitHubService.setupRepoWithFiles(username, projectName, files);
        if (!orgRepoUrl) {
            res.status(500).json({ message: 'Failed to setup repository!' });
            return;
        }

        if (!user || !user.github?.username || !user.github?.accessToken) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }

        const projectDoc = project.project;
        projectDoc.dockerfileContent = DockerFile;
        projectDoc.orgRepositoryUrl = orgRepoUrl;
        projectDoc.k8sManifestContent = k8sManifest;
        try {
            await projectDoc.save();
        } catch (error: unknown) {
            console.error('Failed to save project document:', error);
            res.status(500).json({ message: 'Failed to save project document' });
            return;
        }


        //Step5: Create a pipeline and deployment
        const pipelineName = `${username}-${projectName}-pipeline`
        const pipeline = await createPipelineService({
            projectName,
            username,
            pipelineName,
            gitBranch: body.gitBranch || 'main'
        }, username);

        if (!pipeline.success) {
            res.status(pipeline.statusCode).json({ message: pipeline.message });
            return;
        }

        const deploymentName = `${username}-${projectName}-deployment`;
        const deployment = await createDeploymentService({
            username,
            projectName,
            deploymentName
        }, username);

        if (!deployment.success) {
            res.status(deployment.statusCode).json({ message: deployment.message });
            return;
        }

        //Step6: trigger a build
        const triggerResult = await triggerBuildService({
            projectName,
            username,
            pipelineName,
        }, username);

        if (!triggerResult.success) {
            res.status(triggerResult.statusCode).json({ message: triggerResult.message });
            return;
        }
        res.status(200).json({ message: `Project ${projectName} deployed successfully!` });
    } catch (error) {
        console.error('Error deploying project');
        if (!res.headersSent) {
            next(error);
        }
    }
}