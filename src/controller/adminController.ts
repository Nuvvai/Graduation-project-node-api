import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

/**
 * @author Mennatallah Ashraf
 * @des Controller function for retrieving all users excluding passwords.
 * @route GET /admin/users
 * @access Admin only
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};
