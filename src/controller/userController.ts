import { compare, hash } from 'bcryptjs';
import User, { IUser } from '../models/User';
import { Request, Response, NextFunction } from 'express';

interface IUserRequestParams { 
    name: string ;
}

interface IUserResponseBody {
    newName: string | undefined ,
    newEmail: string | undefined ,
    oldPassword: string | undefined ,
    newPassword: string | undefined ,
    newPasswordAgain: string | undefined 
}

/**
 * @author Hazem Sabry
 * @author Mennatallah
 * @description Retrieves the profile of a user by their name.
 * @param req.params.name - The name of the user to retrieve.
 * @param res - The response object.
 * @returns Promise, if callback has been omitted
 * @throws {Error} - If there is an error fetching the user profile.
 * @route GET /users/:username
 * @access private for the authenticated user only
 */
export const getUserProfile = async (req:Request<IUserRequestParams>, res:Response,next:NextFunction):Promise<void> => {
    try {
        const { name }:IUserRequestParams = req.params;
        const userExists:IUser | null = await User.findOne({ name: name });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        res.status(200).json(userExists)
    } catch (error) {
        next(error);
    }
}

/**
 * @author Hazem Sabry
 * @author Mennatallah
 * @description Deletes a user by name.
 * @param req.params.name - The name of the user to delete.
 * @param res - The response object.
 * @returns A promise that resolves when the user is deleted.
 * @throws {Error} - If there is an error fetching the user profile, or deleting it.
 * @route DELETE /users/:username
 * @access private for the authenticated user only
 */
export const deleteUser = async (req:Request<IUserRequestParams>, res:Response, next:NextFunction):Promise<void> => {
    try {
        const { name }:IUserRequestParams = req.params;
        const userExists:IUser | null = await User.findOne<IUser>({ name: name });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        await User.findOneAndDelete<IUser>({name: name})
        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        next(error);
    }
}

/**
 * @author Hazem Sabry
 * @author Mennatallah
 * @description Updates the user profile with the provided information (selected by name).
 * @param req.params.name - The name of the user to update.
 * @param req.body.newName - The new name for the user.
 * @param req.body.newEmail - The new email for the user.
 * @param req.body.oldPassword - The old password for verification.
 * @param req.body.newPassword - The new password for the user.
 * @param req.body.newPasswordAgain - The new password again for confirmation.
 * @param res - The response object.
 * @returns A promise that resolves when the profile is updated.
 * @throws {Error} - If there is an error fetching the user profile, or error saving the update.
 * @route PUT /users/:username
 * @access private for the authenticated user only
 */
export const updateUserProfile = async (req:Request<IUserRequestParams,{},IUserResponseBody>, res:Response, next:NextFunction):Promise<void> => {
    try {
        const { name }:IUserRequestParams = req.params;
        const userExists:IUser | null = await User.findOne({ name: name });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }

        const user: IUser = userExists;
        
        const { newName, newEmail, oldPassword, newPassword, newPasswordAgain }: IUserResponseBody = req.body;
        if (!newName && !newEmail && !oldPassword && !newPassword && !newPasswordAgain) {
            res.status(400).json({ message: "No information provided to update." });
            return;
        }

        if (newName) {
            user.name = newName;
        }
        if (newEmail) {
            user.email = newEmail;
        }
        if (newPassword && newPasswordAgain && oldPassword && (newPassword === newPasswordAgain)) {
            const isMatch = await compare(oldPassword, user.password);
            if (!isMatch) {
                res.status(400).json({ message: 'Incorrect old password!' });
                return;
            }
            const hashedPassword = await hash(newPassword, 12);
            user.password = hashedPassword;
        } else if (newPassword && !oldPassword) {
            res.status(400).json({ message: "Please enter old password!" });
            return;
        } else if (newPassword != newPasswordAgain) {
            res.status(400).json({ message: "Passwords don't match!" });
            return;
        }
        await user.save();
        res.status(200).json({ message: "Profile updated successfully!", user })

    } catch (error) {
        next(error);
    }
}

/**
 * @author Hazem Sabry
 * @author Mennatallah
 * @description Retrieves all users from the database, excluding their passwords.
 * @returns A promise that resolves when all users are retrieved.
 * @throws {Error} - If there is an error fetching the users.
 * @route GET /users/:username
 * @access private admin only
 */
export const getAllUsers = async (req:Request<{},{},{},{},{}>, res:Response,next:NextFunction):Promise<void> => {
    try {
        const users = await User.find().select('-password');//exclude password
        res.json(users)
    } catch (error) {
        next(error);
    }
}