import { Request, Response, NextFunction } from 'express';
import UserGitHubService from '../utils/UserGitHubService';
import User, { IUser } from '../models/User';
import { formatDistanceToNow } from 'date-fns';

interface Repository {
    id: number;
    name: string;
    language: string | null;
    description: string | null;
    updated_at: string;
}

/**
 * Controller to fetch GitHub repositories for the authenticated user.
 *
 * @param req - The HTTP request object, which contains the authenticated user's information.
 * @param res - The HTTP response object, used to send the response back to the client.
 * @param next - The next middleware function in the Express.js request-response cycle.
 * 
 * @throws Will pass any unexpected errors to the next middleware for error handling.
 * 
 * @remarks
 * - The function retrieves the authenticated user's GitHub username and access token from the database.
 * - If the user does not have GitHub information associated, a 404 response is sent.
 * - If successful, the function fetches the user's GitHub repositories and sends them in the response.
 * 
 * @returns A JSON response containing the user's GitHub repositories.
 * 
 * @route GET /providers/github/repositories/me
 * @access private 
 * @HazemSabry
 */
export const getGithubReposController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { username } = req.user as IUser;
    try {
        const user = await User.findOne<IUser>({ username });
        if (!user?.github) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        const userGithubService = new UserGitHubService(user.github.username, user.github.accessToken);

        const repos= await userGithubService.getRepos() as Repository[] || [];
        if (repos.length === 0) {
            res.status(200).json(repos);
        }

        const repositories = repos.map((repo: Repository) => ({
            id: repo.id,
            name: repo.name,
            language: repo.language,
            description: repo.description,
            isDeployed: false,
            lastUpdated: formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })
        }));
        res.status(200).json(repositories);
    } catch (error) {
        next(error);
    }
}

export const getGitLabReposController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const { username } = req.user as IUser;
    try {

        // const user = await User.findOne<IUser>({ username });
        // if (!user?.github) {
        //     res.status(404).json({ message: "User not found" });
        //     return;
        // }
        // const userGitLabService = new UserGitLabService(user.github.username, user.github.accessToken);
        // const repos = await userGitLabService.getRepos();
        res.status(501).json({ message: "This feature is not supported" });
    } catch (error) {
        next(error);
    }
}

export const getBitbucketReposController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const { username } = req.user as IUser;
    try {

        // const user = await User.findOne<IUser>({ username });
        // if (!user?.github) {
        //     res.status(404).json({ message: "User not found" });
        //     return;
        // }
        // const userGitLabService = new UserGitLabService(user.github.username, user.github.accessToken);
        // const repos = await userGitLabService.getRepos();
        res.status(501).json({ message: "This feature is not supported" });
    } catch (error) {
        next(error);
    }
}

export const getAzureDevOpsReposController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // const { username } = req.user as IUser;
    try {

        // const user = await User.findOne<IUser>({ username });
        // if (!user?.github) {
        //     res.status(404).json({ message: "User not found" });
        //     return;
        // }
        // const userGitLabService = new UserGitLabService(user.github.username, user.github.accessToken);
        // const repos = await userGitLabService.getRepos();
        res.status(501).json({ message: "This feature is not supported" });
    } catch (error) {
        next(error);
    }
}