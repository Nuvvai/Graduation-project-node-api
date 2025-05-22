import { Request, Response, NextFunction } from 'express';
import GenerateDockerFile from './../utils/generateDockerfile';
import  User, { IUser } from '../models/User';
import OrgGitHubService from './../utils/OrgGitHubService';
import UserGitHubService from '../utils/UserGitHubService';
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
    const { username } = req.user as IUser;
    const body = req.body;
    const generateDockerFile = new GenerateDockerFile(req, res, username);
    const orgGitHubService = new OrgGitHubService('Nuvvai');

    try {
        const DockerFile = await generateDockerFile.technologyPath(body.technology, body.webServer || 'nginx');
        if (!DockerFile) return;
        const files = [{
            path: 'Dockerfile',
            content: DockerFile
        },{
            path: 'k8s-manifest.yaml',
            content: k8sManifest
        }]
        const orgRepoUrl = await orgGitHubService.setupRepoWithFiles(username, projectName, files);
        if (!orgRepoUrl) {
            res.status(500).json({ message: 'Failed to setup repository!' });
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