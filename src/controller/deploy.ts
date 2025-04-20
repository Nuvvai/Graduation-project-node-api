import { Request, Response, NextFunction } from 'express';
import GenerateDockerFile from './../utils/generateDockerfile';
import  { IUser } from '../models/User';
import OrgGitHubService from './../utils/OrgGitHubService';

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