import { Request, Response, NextFunction } from 'express';
import GenerateDockerFile from './../utils/generateDockerfile';
import  { IUser } from '../models/User';
import OrgGitHubService from './../utils/OrgGitHubService';
import { createProjectService } from '../services/projectService';
import { createPipelineService, triggerBuildService } from '../services/pipelineService';
import { createDeploymentService } from '../services/deploymentService';
import { generateK8sManifest } from '../utils/generatek8sManifestFiles';

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
    const { projectName } = req.params;
    const { username } = req.user as IUser;
    const body = req.body;
    const generateDockerFile = new GenerateDockerFile(req, res, username);
    const orgGitHubService = new OrgGitHubService('Nuvvai');

    try {
        //Step1: Create a project
        const project = await createProjectService({
            projectName,
            username,
            repositoryUrl: body.repositoryUrl,
            framework: body.framework,
            description: body.description
        }, username);

        //Step2: Create a Dockerfile and Kubernetes manifest
        const DockerFile = await generateDockerFile.technologyPath(body.technology, body.webServer || 'nginx');
        if (!DockerFile){
            res.status(400).json({ message: 'Failed to generate Dockerfile for the specified technology' });
            return;
        }
        const k8sManifest = generateK8sManifest(username, projectName, body.containerPort || 3000);
        if (!k8sManifest){
            res.status(400).json({ message: 'Failed to generate Kubernetes manifest file' });
            return;
        }
        const files = [{
            path: 'Dockerfile',
            content: DockerFile
        },{
            path: 'k8s-manifest.yaml',
            content: k8sManifest
        }]

        //Step3: Set up GitHub repository with files
        const orgRepoUrl = await orgGitHubService.setupRepoWithFiles(username, projectName, files);
        if (!orgRepoUrl) {
            res.status(500).json({ message: 'Failed to setup repository!' });
            return;
        }

        project.dockerfileContent = DockerFile;
        project.orgRepositoryUrl = orgRepoUrl;
        project.k8sManifestContent = k8sManifest;
        await project.save();

        //Step4: Generate repository token and create webhook

        //Step5: Create a pipeline and deployment
        const pipelineName = `${username}-${projectName}-pipeline`
        await createPipelineService({
            projectName,
            username,
            pipelineName,
            gitBranch: body.gitBranch || 'main'
        }, username);

        const deploymentName = `${username}-${projectName}-deployment`;
        await createDeploymentService({
            username,
            projectName,
            deploymentName
        }, username);

        //Step6: trigger a build
        await triggerBuildService({
            projectName,
            username,
            pipelineName,
        }, username);

        res.status(200).json({ message: `Project ${projectName} deployed successfully!` });
    } catch (error) {
        console.error('Error deploying project');
        next(error);
    }
}