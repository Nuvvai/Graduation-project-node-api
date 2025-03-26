import { Request, Response, NextFunction } from 'express';
import User, {IUser} from '../models/User';
import Project, {IProject} from '../models/Project';
import Deployment, {IDeployment} from '../models/Deployment';
import Pipeline, {IPipeline} from '../models/Pipeline';

/**
 * @author Mennatallah Ashraf
 * @des Controller function for retrieving all users excluding passwords.
 * @route GET /admin/users
 * @access Admin only
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await User.find<IUser>().select('-password');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

/**
 * @author Mennatallah Ashraf
 * @des Controller function for updating a user role to admin.
 * @route PUT /admin/users/:username
 * @access Admin only
 */
export const updateUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {username} = req.params;
    try{
        const userExists = await User.findOne<IUser>({username})
        if(!userExists){
            res.status(404).json({message: 'User not found!'})
            return
        }
        if(userExists.role === 'admin'){
            res.status(403).json({message: 'Cannot update admin role!'})
            return
        }
        const updatedUser = await User.findOneAndUpdate({username}, {role: 'admin'}, {new: true})
        res.status(200).json({message: 'User role updated successfully!', updatedUser})
    }catch(error){
        next(error)
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for retrieving system statistics.
 * @route GET /admin/stats
 * @access Admin only
 */
export const getSystemStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await User.find<IUser>().select('-password');
        const usersCount = users.length;
        const adminsCount = users.filter(user => user.role === 'admin').length;
        const regularUsersCount = usersCount - adminsCount;

        const projectsCount = await Project.countDocuments();
        const deploymentsCount = await Deployment.countDocuments();
        const pipelinesCount = await Pipeline.countDocuments();

        res.status(200).json({
            users: {
                total: usersCount,
                admins: adminsCount,
                regularUsers: regularUsersCount
            },
            projects: {
                total: projectsCount
            },
            deployments: {
                total: deploymentsCount
            },
            pipelines: {
                total: pipelinesCount
            }
        });
    } catch (error) {
        next(error);
    }
}
