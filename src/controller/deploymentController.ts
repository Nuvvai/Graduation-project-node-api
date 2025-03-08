import { Request, Response, NextFunction } from 'express';
import Deployment, { IDeployment } from '../models/Deployment'; 
import Project, {IProject} from '../models/Project';
import User, { IUser } from '../models/User';

interface CreateDeploymentRequestParams {
    username: string;
    projectName: string;
}

interface CreateDeploymentRequestBody {
    deploymentName: string;
    status: string;
    startTime?: Date;
    endTime?: Date;
}

interface GetDeploymentsRequestParams {
    username: string;
}

interface GetDeploymentsByProjectRequestParams {
    username: string;
    projectName: string;
}

interface DeleteDeploymentsRequestParams {
    username: string;
    projectName: string;
}

interface DeleteDeploymentRequestParams {
    username: string;
    projectName: string;
    deploymentName: string;
}



/**
 * @author Mennatallah Ashraf
 * @des Controller function for creating a new deployment for a project.
 * @route POST /deployments/:username/:projectName
 * @access private
 */
export const createDeployment = async (
    req: Request<CreateDeploymentRequestParams, {}, CreateDeploymentRequestBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username, projectName} : CreateDeploymentRequestParams = req.params;
    const { deploymentName, status = 'No status', startTime = new Date(), endTime = new Date() } : CreateDeploymentRequestBody= req.body;
    const user = req.user as IUser;
    try {
        if (!user) {
            res.status(401).json({ message: "Authentication required!" });
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
        if (!projectExists) {
            res.status(404).json({ message: "Project not found!" })
            return;
        }
        const deploymentExists = await Deployment.findOne<IDeployment>({username, projectName, deploymentName})
        if(deploymentExists){
            res.status(403).json({message: "Deployment with the same name already exists!"})
            return;
        }
        if(!deploymentName){
            res.status(400).json({message: "Deployment name is required!"});
            return;
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
        res.status(201).json(deployment)
    } catch (error) {
        next(error);
    }
}


/**
 * @author Mennatallah Ashraf
 * @des Controller function for retrieving all deployments for a given user.
 * @route GET /deployments/:username
 * @access private
 */
export const getAllDeployments = async (
    req: Request<GetDeploymentsRequestParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username } : GetDeploymentsRequestParams = req.params;
    const user = req.user as IUser;
    try {
        if (!user) {
            res.status(401).json({ message: "Authentication required!" });
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
        const deployments = await Deployment.find<IDeployment>({ username }).sort({ startTime: -1 }); //starting from the recent deployment
        if (!deployments.length) {
            res.status(404).json({ message: "Deployments not found for this user!" })
            return;
        }
        res.status(200).json(deployments)

    } catch (error) {
        next(error);
    };
}


/**
 * @author Mennatallah Ashraf
 * @des Controller function for retrieving all deployments for a given user and project.
 * @route GET /deployments/:username/:projectName
 * @access private
 */
export const getDeploymentsByProject = async (
    req: Request<GetDeploymentsByProjectRequestParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username, projectName } : GetDeploymentsByProjectRequestParams = req.params;
    const user = req.user as IUser;
    try {
        if (!user) {
            res.status(401).json({ message: "Authentication required!" });
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
        if (!projectExists) {
            res.status(404).json({ message: "Project not found!" })
            return;
        }
        const deployments = await Deployment.find<IDeployment>({ username, projectName }).sort({ startTime: -1 });
        if (!deployments.length) {
            res.status(404).json({ message: "Deployments not found for this project!" })
            return;
        }
        res.status(200).json(deployments)
    } catch (error) {
        next(error);
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for deleting all deployments for a given user and project.
 * @route DELETE /deployments/:username/:projectName
 * @access private
 */
export const deleteDeployments = async (
    req: Request<DeleteDeploymentsRequestParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username, projectName } : DeleteDeploymentsRequestParams = req.params;
    const user = req.user as IUser;
    try {
        if (!user) {
            res.status(401).json({ message: "Authentication required!" });
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
        if (!projectExists) {
            res.status(404).json({ message: "Project not found!" })
            return;
        }
        const deploymentsDeleted = await Deployment.deleteMany({ username, projectName });
        if (deploymentsDeleted.deletedCount === 0) {
            res.status(404).json({message: 'No deployments found for this project'});
            return;
        }
        res.status(200).json({ message: "Deployments deleted successfully!" })
    } catch (error) {
        next(error);
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for deleting a deployment for a given user and project.
 * @route DELETE /deployments/:username/:projectName/:deploymentName
 * @access private
 */
export const deleteDeployment = async (
    req: Request<DeleteDeploymentRequestParams>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const { username, projectName, deploymentName } : DeleteDeploymentRequestParams = req.params;
    const user = req.user as IUser;
    try{
        if (!user) {
            res.status(401).json({ message: "Authentication required!" });
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
        if (!projectExists) {
            res.status(404).json({ message: "Project not found!" })
            return;
        }
        const deploymentExists = await Deployment.findOne<IDeployment>({deploymentName})
        if(!deploymentExists){
            res.status(404).json({message: "Deployment not found!"})
            return;
        }
        await Deployment.findOneAndDelete<IDeployment>({deploymentName});
        res.status(200).json({ message: "Deployment deleted successfully!" })
    }catch(error){
        next(error);
    }
}

// /**
//  * Updates the deployment status for a given project and user.
//  *
//  * @param {Object} req - The request object.
//  * @param {Object} req.body - The request body.
//  * @param {string} req.body.projectName - The name of the project.
//  * @param {string} req.body.username - The name of the user.
//  * @param {string} req.body.status - The status of the deployment. Must be one of 'No status', 'Failed', or 'Succeeded'.
//  * @param {Object} res - The response object.
//  * @returns {Promise<void>} - Returns a promise that resolves to void.
//  */
// const updateDeploymentStatus = async (req, res)=>{
//     try{
//         const {projectName, username, status} = req.body;
//         const userExists = await User.findOne({ name: username });
//         if (!userExists) {
//             return res.status(404).json({
//                 message: 'User not found!'
//             })
//         }
//         const projectExists = await Project.findOne({ projectName });
//         if (!projectExists) {
//             return res.status(404).json({ message: "Project not found!" })
//         }
//         if(!['No status', 'Failed', 'Succeeded'].includes(status)){
//             return res.status(400).json({message: "Invalid status!"})
//         }
//         const deployment = await Deployment.findOne({projectName, username});
//         if(!deployment){
//             return res.status(404).json({message: "Deployments not found!"})
//         }
//         deployment.status = status;
//         if(status === "Failed" || status === "Succeeded"){
//             deployment.endTime = endTime || new Date();
//         }
//         const updatedDeployment = await deployment.save();
//         res.status(200).json(updatedDeployment);
//     }catch(error){
//         res.status(500).json({
//             message: "Error updating deployment status!",
//             error: error.message
//         })
//     }
// }
