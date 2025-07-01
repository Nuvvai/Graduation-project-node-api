import Deployment, { IDeployment } from '../models/Deployment';
import Project, { IProject } from '../models/Project';
import User, { IUser } from '../models/User';

interface CreateDeploymentData {
    username: string;
    projectName: string;
    deploymentName: string;
    status?: string;
    startTime?: Date;
    endTime?: Date;
}

/**
 * @author Mennatallah Ashraf
 * @des Service function for creating a new deployment for a project.
 * @throws Will throw an error with appropriate message and status code if validation fails
 */
export const createDeploymentService = async (
    data: CreateDeploymentData,
    currentUsername: string
): Promise<IDeployment> => {
    const {
        username,
        projectName,
        deploymentName,
        status = 'No status',
        startTime = new Date(),
        endTime = new Date(),
    } = data;

    if (!deploymentName) {
        const error = new Error('Deployment name is required!') as any;
        error.statusCode = 400;
        throw error;
    }

    const userExists = await User.findOne<IUser>({ username });
    if (!userExists) {
        const error = new Error('User not found!') as any;
        error.statusCode = 404;
        throw error;
    }

    const currentUser = await User.findOne<IUser>({ username: currentUsername });
    if (!currentUser) {
        const error = new Error('Current user not found!') as any;
        error.statusCode = 404;
        throw error;
    }

    if ((currentUsername !== username) && (currentUser.role !== 'admin')) {
        const error = new Error('Unauthorized action!') as any;
        error.statusCode = 403;
        throw error;
    }

    const projectExists = await Project.findOne<IProject>({ username, projectName });
    if (!projectExists) {
        const error = new Error('Project not found!') as any;
        error.statusCode = 404;
        throw error;
    }

    const deploymentExists = await Deployment.findOne<IDeployment>({
        username,
        projectName,
        deploymentName
    });

    if (deploymentExists) {
        const error = new Error('Deployment with the same name already exists!') as any;
        error.statusCode = 403;
        throw error;
    }
    const deployment = new Deployment({
        deploymentName,
        projectName,
        username,
        status,
        startTime,
        endTime
    });

    await deployment.save();
    return deployment;
};