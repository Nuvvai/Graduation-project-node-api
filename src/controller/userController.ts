import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import Validate from '../utils/Validate';


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
 * @route GET /users/me
 * @access private
 */
export const getUserProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as IUser;
    const username = user.username;
    try {
        const userExists = await User.findOne<IUser>({username}).select('-password'); // Exclude password;
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
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
 * @route DELETE /users/me
 * @access private
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as IUser;
    const username = user.username;
    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
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
 * @route PUT /users/me
 * @access private
 */
export const updateUserProfile = async (req: Request<object, object, UpdateUserProfileRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { newName, newEmail, newPassword, newPasswordAgain, oldPassword } : UpdateUserProfileRequestBody = req.body;
    const user = req.user as IUser;
    const username = user.username;
    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }

        const validate = new Validate(res);

        validate.usernameSyntax(username);
        if (newEmail) validate.emailSyntax(newEmail);
        if (newPassword) validate.passwordSyntax(newPassword);
        if (newPasswordAgain) validate.passwordSyntax(newPasswordAgain);
        if (oldPassword) validate.passwordSyntax(oldPassword);
        // await validate.usernameExists(username);

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

