import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import axios from 'axios';

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
 * @route GET /users/me
 * @access private
 */
export const getUserProfile = async (req: Request<GetUserProfileRequestParams>, res: Response, next: NextFunction): Promise<void> => {
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
export const deleteUser = async (req: Request<DeleteUserRequestParams>, res: Response, next: NextFunction): Promise<void> => {
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
export const updateUserProfile = async (req: Request<UpdateUserProfileRequestParams, object, UpdateUserProfileRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { newName, newEmail, newPassword, newPasswordAgain, oldPassword }: UpdateUserProfileRequestBody = req.body;
    if (!newName &&!newEmail &&!newPassword &&!newPasswordAgain) {
        res.status(400).json({ message: 'No fields provided to update!' });
        return;
    }
    const user = req.user as IUser;
    const username = user.username;
    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
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

export const updateGithubUserProfile = async (req: Request<UpdateUserProfileRequestParams, object, { code: string }>, res: Response): Promise<void> => {
    const {username} = req.user as IUser;
    
    const { code } = req.body;
    if (!code) {
        res.status(400).json({ message: "Authorization code is missing" });
        return;
    }

    // Exchange the code for an access token
    const tokenResponse = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
        },
        {
            headers: { Accept: "application/json" },
        }
    );

    const githubAccessToken = tokenResponse.data.access_token;
    if (!githubAccessToken) {
        res.status(400).json({ message: "Failed to retrieve access token" });
        return;
    }

    // Fetch user data from GitHub using the access token
    const userResponse = await axios.get("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${githubAccessToken}` },
    });

    const githubUser = userResponse.data;
    let user = await User.findOne<IUser>({ 'github.id': githubUser.id });
    if (user) {
        res.status(409).json({ message: "GitHub account is already attache to another account" });
        return;
    }

    user = await User.findOne<IUser>({ username });
    if (!user) {
        res.status(404).json({ message: 'User not found!' });
        return;
    }
    
    user.github = {
        id: githubUser.id,
        username: githubUser.login,
        email: githubUser.email,
        accessToken: githubAccessToken,
    };
    
    await user.save();

    res.status(200).json({ message: "GitHub profile updated successfully!", user });
}

export const updateGitlabUserProfile = async (req: Request<UpdateUserProfileRequestParams, object, {code:string}>, res:Response): Promise<void> => {
    // const { code } = req.body;
    // Implement Gitlab OAuth flow and update user's profile with Gitlab data.
    res.status(501).json({ message: "This feature is not supported" });
}

export const updateBitbucketUserProfile = async (req: Request<UpdateUserProfileRequestParams, object, {code:string}>, res:Response): Promise<void> => {
    // const { code } = req.body;
    // Implement Gitlab OAuth flow and update user's profile with Gitlab data.
    res.status(501).json({ message: "This feature is not supported" });
}

export const updateAzureDevOpsUserProfile = async (req: Request<UpdateUserProfileRequestParams, object, {code:string}>, res:Response): Promise<void> => {
    // const { code } = req.body;
    // Implement Gitlab OAuth flow and update user's profile with Gitlab data.
    res.status(501).json({ message: "This feature is not supported" });
}