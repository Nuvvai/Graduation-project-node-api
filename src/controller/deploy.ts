import { Request, Response, NextFunction } from 'express';
import GenerateDockerFile from './../utils/generateDockerfile';
import  { IUser } from '../models/User';
import OrgGitHubService from './../utils/OrgGitHubService';

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
 * 1. Extracts the `projectName` from the request parameters and `username` from the authenticated user.
 * 2. Uses the `GenerateDockerFile` service to create a Dockerfile based on the provided technology and web server.
 * 3. Sets up a GitHub repository with the generated Dockerfile using the `OrgGitHubService`.
 * 4. Sends a success response if the repository is set up successfully, or an error response otherwise.
 */
export const deployProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { projectName } = req.params;
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
        }]
        const orgRepoUrl = await orgGitHubService.setupRepoWithFiles(username, projectName, files);
        if (!orgRepoUrl) {
            res.status(500).json({ message: 'Failed to setup repository!' });
            return;
        }
        res.status(200).json({ message: `Project ${projectName} deployed successfully!` });
    } catch (error) {
        console.error('Error deploying project');
        next(error);
    }
}