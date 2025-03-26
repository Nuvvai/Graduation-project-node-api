import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

interface GetUserProfileRequestParams {
    username: string;
}

interface DeleteUserRequestParams {
    username: string;
}

interface UpdateUserProfileRequestParams {
    username: string;
}

interface UpdateUserProfileRequestBody {
    newName?: string;
    newEmail?: string;
    newPassword?: string;
    newPasswordAgain?: string;
    oldPassword?: string;
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for retrieving a user profile by name.
 * @route GET /users/:username
 * @access private
 */
export const getUserProfile = async (req: Request<GetUserProfileRequestParams>, res: Response, next: NextFunction): Promise<void> => {
    const { username } = req.params;
    const user = req.user as IUser;

    try {
        const userExists = await User.findOne<IUser>({username}).select('-password'); // Exclude password;
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
        res.status(200).json(userExists);
    } catch (error) {
        next(error);
    }
};

/**
 * @author Mennatallah Ashraf
 * @des Controller function for deleting a user by name.
 * @route DELETE /users/:username
 * @access private
 */
export const deleteUser = async (req: Request<DeleteUserRequestParams>, res: Response, next: NextFunction): Promise<void> => {
    const { username } : DeleteUserRequestParams = req.params;
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
        await User.findOneAndDelete<IUser>({ username });
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        next(error);
    }
};

/**
 * @author Mennatallah Ashraf
 * @des Controller function for updating a user profile.
 * @route PUT /users/:username
 * @access private
 */
export const updateUserProfile = async (req: Request<UpdateUserProfileRequestParams, object, UpdateUserProfileRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { username } : UpdateUserProfileRequestParams = req.params;
    const { newName, newEmail, newPassword, newPasswordAgain, oldPassword } : UpdateUserProfileRequestBody = req.body;
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
        if (newName) userExists.username = newName;
        if (newEmail) userExists.email = newEmail;

        if (newPassword && newPasswordAgain && oldPassword && newPassword === newPasswordAgain) {
            if (!userExists.password) {
                res.status(400).json({ message: 'Password is missing!' });
                return;
            }
            const isMatch = await bcrypt.compare(oldPassword, userExists.password);
            if (!isMatch) {
                res.status(400).json({ message: 'Incorrect old password!' });
                return;
            }
            userExists.password = await bcrypt.hash(newPassword, 12);
        } else if (newPassword && !oldPassword) {
            res.status(400).json({ message: "Please enter old password!" });
            return;
        } else if (newPassword !== newPasswordAgain) {
            res.status(400).json({ message: "Passwords don't match!" });
            return;
        }

        await userExists.save();
        res.status(200).json({ message: "Profile updated successfully!", userExists });
    } catch (error) {
        next(error);
    }
};

