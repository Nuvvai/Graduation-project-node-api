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

type DeploymentServiceResult =
    | { success: true; deployment: IDeployment }
    | { success: false; statusCode: number; message: string };


/**
 * @author Mennatallah Ashraf
 * @des Service function for creating a new deployment for a project.
 */
export const createDeploymentService = async (
    data: CreateDeploymentData,
    currentUsername: string
): Promise<DeploymentServiceResult> => {
    const {
        username,
        projectName,
        deploymentName,
        status = 'No status',
        startTime = new Date(),
        endTime = new Date(),
    } = data;


    const userExists = await User.findOne<IUser>({ username });
    if (!userExists) {
        return {success:false, statusCode: 404, message: "User not found!"};
    }

    const currentUser = await User.findOne<IUser>({ username: currentUsername });
    if (!currentUser) {
        return {success:false, statusCode: 404, message: "Current user not found!"};
    }

    if ((currentUsername !== username) && (currentUser.role !== 'admin')) {
        return {success:false, statusCode: 403, message: "Unauthorized action!"};
    }

    const projectExists = await Project.findOne<IProject>({ username, projectName });
    if (!projectExists) {
        return {success:false, statusCode: 404, message: "Project not found!"};
    }

    const deploymentExists = await Deployment.findOne<IDeployment>({
        username,
        projectName,
        deploymentName
    });

    if (deploymentExists) {
        return {success:false, statusCode: 403, message: "Deployment with the same name already exists!"};
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
    return { success: true, deployment };
};