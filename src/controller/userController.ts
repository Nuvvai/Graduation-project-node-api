import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';
import axios from 'axios';
import Validate from '../utils/Validate';
import Token from '../utils/Token';


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
        const userExists = await User.findOne<IUser>({ username }).select('-password'); // Exclude password;
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
export const updateUserProfile = async (req: Request<{}, {}, UpdateUserProfileRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { newName, newEmail, newPassword, newPasswordAgain, oldPassword }: UpdateUserProfileRequestBody = req.body;
    if (!newName && !newEmail && !newPassword && !newPasswordAgain) {
        res.status(400).json({ message: 'No fields provided to update!' });
        return;
    }

    const user = req.user as IUser;
    const username = user.username;
    /**Creates a new Token instance to handle token-related operations.*/
    const token = new Token(res);

    try {
        const userExists = await User.findOne<IUser>({ username });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }

        const validate = new Validate(res);

        if (newName) if (!(await validate.usernameSyntax(username))) return;
        if (newEmail) if (!(await validate.emailSyntax(newEmail))) return;
        if (newPassword) if (!(await validate.passwordSyntax(newPassword))) return;
        if (newPasswordAgain) if (!(await validate.passwordSyntax(newPasswordAgain))) return;
        if (oldPassword) if (!(await validate.passwordSyntax(oldPassword))) return;
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

        await token.sendRefreshToken(userExists);
        res.status(200).json({ message: "Profile updated successfully!" });
    } catch (error) {
        next(error);
    }
};

/**
 * Updates the GitHub profile of a user by linking their GitHub account to their existing user account.
 * 
 * @param req - The HTTP request object containing:
 *   - `user`: The authenticated user object, which includes the `username`.
 *   - `body`: An object containing the `code` parameter, which is the GitHub authorization code.
 * @param res - The HTTP response object used to send the response back to the client.
 * 
 * @returns A promise that resolves to void. Sends an appropriate HTTP response:
 *   - 200: If the GitHub profile is successfully linked to the user account.
 *   - 400: If the authorization code is missing or the access token retrieval fails.
 *   - 404: If the user is not found in the database.
 *   - 409: If the GitHub account is already linked to another user account.
 * 
 * @throws May throw errors related to HTTP requests or database operations.
 * 
 * The function performs the following steps:
 * 1. Validates the presence of the GitHub authorization code in the request body.
 * 2. Exchanges the authorization code for an access token using GitHub's OAuth API.
 * 3. Fetches the GitHub user's profile data using the access token.
 * 4. Checks if the GitHub account is already linked to another user account.
 * 5. Links the GitHub account to the authenticated user's account and saves the updated user data.
 * 
 * @route PUT /users/me/github 
 * @access private 
 * 
 * @HazemSabry
 */
export const updateGithubUserProfile = async (req: Request<object, object, { code: string }>, res: Response): Promise<void> => {
    const { username } = req.user as IUser;

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
    if (user && user?.username !== username) {
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

/**
 * Updates the GitLab user profile by implementing the GitLab OAuth flow
 * and synchronizing the user's profile with GitLab data.
 * 
 * @param req - The HTTP request object containing the parameters and body.
 *              - `req.params`: Parameters for the update request.
 *              - `req.body.code`: The authorization code from GitLab OAuth.
 * @param res - The HTTP response object used to send the response.
 * 
 * @returns A promise that resolves to void. Currently, this feature is not implemented
 *          and responds with a 501 status code indicating it is not supported.
 * 
 * @route PUT /users/me/gitlab 
 * @access private
 * 
 * @HazemSabry
 */
export const updateGitlabUserProfile = async (req: Request<object, object, { code: string }>, res: Response): Promise<void> => {
    // const { code } = req.body;
    // Implement Gitlab OAuth flow and update user's profile with Gitlab data.
    res.status(501).json({ message: "This feature is not supported" });
}

/**
 * Updates the Bitbucket user profile by implementing the GitLab OAuth flow
 * and updating the user's profile with GitLab data.
 * 
 * @param req - The HTTP request object containing the request parameters, 
 *              body, and other metadata. The body should include the `code` 
 *              parameter for the OAuth flow.
 * @param res - The HTTP response object used to send the response back to the client.
 * 
 * @returns A promise that resolves to void. 
 * 
 * @remarks
 * Currently, this feature is not supported
 *          and responds with a 501 status code and a message indicating the same.
 * 
 * @route PUT /users/me/bitbucket 
 * @access private
 * 
 * @HazemSabry
 */
export const updateBitbucketUserProfile = async (req: Request<object, object, { code: string }>, res: Response): Promise<void> => {
    // const { code } = req.body;
    // Implement Gitlab OAuth flow and update user's profile with Gitlab data.
    res.status(501).json({ message: "This feature is not supported" });
}

/**
 * Updates the Azure DevOps user profile by implementing the GitLab OAuth flow
 * and updating the user's profile with GitLab data.
 * 
 * @param req - The HTTP request object containing the parameters and body.
 * @param req.params - The route parameters for the request.
 * @param req.body - The request body containing the authorization code.
 * @param req.body.code - The authorization code for GitLab OAuth.
 * @param res - The HTTP response object used to send the response.
 * 
 * @returns A promise that resolves to void.
 * 
 * @remarks
 * Currently, this feature is not supported and will return a 501 status code
 * with a message indicating that the feature is not implemented.
 * 
 * @route PUT /users/me/azure-devops 
 * @access private
 * 
 * @HazemSabry
 */
export const updateAzureDevOpsUserProfile = async (req: Request<object, object, { code: string }>, res: Response): Promise<void> => {
    // const { code } = req.body;
    // Implement Gitlab OAuth flow and update user's profile with Gitlab data.
    res.status(501).json({ message: "This feature is not supported" });
}