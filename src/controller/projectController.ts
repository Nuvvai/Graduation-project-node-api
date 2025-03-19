import { Request, Response, NextFunction } from 'express';
import Project, {IProject} from '../models/Project';
import User, { IUser } from '../models/User';

interface CreateProjectRequestParams {
    username: string;
}

interface CreateProjectRequestBody {
    projectName: string;
    repositoryUrl: string;
    framework: string;
    description?: string;
}

interface GetAllProjectsRequestParams {
    username: string;
}

interface DeleteProjectRequestParams {
    username: string;
    projectName: string;
}

interface DeleteAllProjectsRequestParams {
    username: string;
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for creating a new project for a user.
 * @route POST /projects/:username
 * @access private
 */
export const createProject = async (
    req: Request<CreateProjectRequestParams, {}, CreateProjectRequestBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username } : CreateProjectRequestParams = req.params;
    const { projectName, repositoryUrl, framework, description } : CreateProjectRequestBody= req.body;
    const user = req.user as IUser;

    try {
        if (!projectName || !username || !repositoryUrl || !framework) {
            res.status(400).json({ message: 'All required fields must be provided!' });
            return;
        }
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        const currentUser = await User.findOne<IUser>({ username: user.username });
        if (!currentUser) {
            res.status(404).json({ message: "Current user not found!" });
            return;
        }
        if ((user.username !== username) && (currentUser.role !== 'admin')) {
            res.status(403).json({ message: "Unauthorized action!" });
            return;
        }

        const projectExists = await Project.findOne<IProject>({ username, projectName });
        if (projectExists) {
            res.status(400).json({ message: 'Project with the same name already exists!' });
            return;
        }

        const newProject = new Project({
            projectName,
            username,
            repositoryUrl,
            framework,
            description
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        next(error);
    }
};

/**
 * @author Mennatallah Ashraf
 * @des Controller function for retrieving all projects for a given user.
 * @route GET /projects/:username
 * @access private
 */
export const getAllProjects = async (
    req: Request<GetAllProjectsRequestParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username } : GetAllProjectsRequestParams = req.params;
    const user = req.user as IUser;
    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        const currentUser = await User.findOne<IUser>({ username: user.username });
        if (!currentUser) {
            res.status(404).json({ message: "Current user not found!" });
            return;
        }
        if ((user.username !== username) && (currentUser.role !== 'admin')) {
            res.status(403).json({ message: "Unauthorized action!" });
            return;
        }

        const projects = await Project.find<IProject>({ username });
        res.status(200).json(projects);
    } catch (error) {
        next(error);
    }
};

/**
 * @author Mennatallah Ashraf
 * @des Controller function for deleting a project by username and project name.
 * @route DELETE /projects/:username/:projectName
 * @access private
 */
export const deleteProject = async (
    req: Request<DeleteProjectRequestParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username, projectName } : DeleteProjectRequestParams = req.params;
    const user = req.user as IUser;

    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        const currentUser = await User.findOne<IUser>({ username: user.username });
        if (!currentUser) {
            res.status(404).json({ message: "Current user not found!" });
            return;
        }
        if ((user.username !== username) && (currentUser.role !== 'admin')) {
            res.status(403).json({ message: "Unauthorized action!" });
            return;
        }
        if (!username || !projectName) {
            res.status(400).json({ message: 'Username and project name are required!' });
            return;
        }

        const projectExists = await Project.findOne<IProject>({ username, projectName });
        if (!projectExists) {
            res.status(404).json({ message: 'Project not found!' });
            return;
        }

        await Project.findOneAndDelete<IProject>({ username, projectName });
        res.status(200).json({ message: 'Project deleted successfully!' });
    } catch (error) {
        next(error);
    }
};

/**
 * @author Mennatallah Ashraf
 * @des Controller function for deleting all projects associated with a specific user.
 * @route DELETE /projects/:username
 * @access private
 */
export const deleteAllProjects = async (
    req: Request<DeleteAllProjectsRequestParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username } : DeleteAllProjectsRequestParams = req.params;
    const user = req.user as IUser;

    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        const currentUser = await User.findOne<IUser>({ username: user.username });
        if (!currentUser) {
            res.status(404).json({ message: "Current user not found!" });
            return;
        }
        if ((user.username !== username) && (currentUser.role !== 'admin')) {
            res.status(403).json({ message: "Unauthorized action!" });
            return;
        }
        if (!username) {
            res.status(400).json({ message: 'Username is required!' });
            return;
        }

        const projectsDeleted = await Project.deleteMany({ username });
        if (projectsDeleted.deletedCount === 0) {
            res.status(404).json({ message: 'No projects found for this user!' });
            return;
        }

        res.status(200).json({ message: 'All projects deleted successfully!' });
    } catch (error) {
        next(error);
    }
};
