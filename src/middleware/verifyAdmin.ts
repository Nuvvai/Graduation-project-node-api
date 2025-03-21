import { Request, Response, NextFunction } from 'express';
import User, {IUser} from '../models/User';
import { IJwtSignPayload } from '../controller/authController';

/**
 * @author Mennatallah Ashraf
 * @des Middleware function to verify if the authenticated user has admin rights.
 * @param req Request object containing the user from JWT
 * @param res Response object
 * @param next Next function
 * @returns A promise that resolves when the user is verified as admin
 */
export const verifyAdmin = async(req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IJwtSignPayload;

        const userExists = await User.findOne<IUser>({ username: user.username });
        
        if (!userExists) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (userExists.role !== 'admin') {
            res.status(403).json({ message: "Access denied: Admin privileges required!" });
            return;
        }
        next();
    } catch (error) {
        console.error("Admin verification error:", (error as Error).message);
        res.status(500).json({ message: "Server error during admin verification" });
    }
};