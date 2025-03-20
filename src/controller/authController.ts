import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import ms from 'ms';
import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";

import User, { IUser } from '../models/User';

const refreshTokenExpiresIn: ms.StringValue = '7d'
const accessTokenExpiresIn: ms.StringValue = '15m'

/**
 * Interface representing the properties of a refresh token cookie.
 * 
 * @interface IRefreshToken_cookiesProperty
 * @property {boolean} httpOnly - Indicates whether the cookie is accessible only through the HTTP protocol.
 * @property {boolean} secure - Indicates whether the cookie is only to be sent over HTTPS.
 * @property {boolean | 'lax' | 'strict' | undefined | "none"} sameSite - Indicates the same-site policy for the cookie.
 * @property {string} Domain - The domain for which the cookie is valid.
 * @property {string} path - The path for which the cookie is valid.
 * @property {number} maxAge - The maximum age of the cookie in seconds.
 * 
 * @HazemSabry
 */
interface IRefreshToken_cookiesProperty {
    /**
     * Indicates whether the cookie is accessible only through the HTTP protocol.
     */
    httpOnly: boolean;

    /**
     * Indicates whether the cookie is only to be sent over HTTPS.
     */
    secure: boolean;

    /**
     * Indicates the same-site policy for the cookie.
     * Can be a boolean or one of 'lax', 'strict', or 'none'.
     */
    sameSite: boolean | 'lax' | 'strict' | undefined | "none";

    /**
     * The domain for which the cookie is valid.
     */
    Domain: string;

    /**
     * The path for which the cookie is valid.
     */
    path: string;

    /**
     * The maximum age of the cookie in seconds.
     */
    maxAge: number;
}

const FRONTEND_DOMAIN_NAME: string = process.env.FRONTEND_DOMAIN_NAME || 'http://localhost:5173';
const refreshToken_cookiesProperty: IRefreshToken_cookiesProperty = { httpOnly: true, secure: true, sameSite: 'none', Domain: FRONTEND_DOMAIN_NAME, path: '/', maxAge: 7 * 24 * 60 * 60 * 1000 };

/**
 * Interface representing the request body for user registration.
 * 
 * @interface RegisterRequestBody
 * @property {string} username - The username of the register user.
 * @property {string} email - The email of the register user.
 * @property {string} password - The password of the register user.
 * 
 * @HazemSabry
 */
interface RegisterRequestBody {
    /**
     * The username of the register user.
     */
    username: string;
    /**
     * The email of the register user.
     */
    email: string;
    /**
     * The password of the register user.
     */
    password: string;
}

/**
 * Interface representing the request body for a login operation.
 * 
 * @interface LoginRequestBody
 * @property {string} usernameOrEmail - The username or email of the user to login with.
 * @property {string} password - The password of the user to login with.
 * 
 * @HazemSabry
 */
interface LoginRequestBody {
    /**
     * The username or email of the user to login with.
     */
    usernameOrEmail: string;
    /**
     * The password of the user to login with.
     */
    password: string;
}

/**
 * Interface representing the payload for JWT signing.
 * 
 * @interface IJwtSignPayload
 * @property {string} id - The unique identifier of the user.
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * 
 * @HazemSabry
 */
export interface IJwtSignPayload  {
    /**
     * The unique identifier of the user.
     */
    id: string,
    /**
     * The username of the user.
     */
    username: string,
    /**
     * The email address of the user.
     */
    email: string
}

/**
 * Controller function for user registration.
 * @param req.body.username - The username of the register user.
 * @param req.body.email - The email of the register user.
 * @param req.body.password - The password of the register user.
 * @returns A promise that resolves when the registration is successful.
 * @throws { Error } if failed to encrypt the password, or create new user, or the environment variable JWT_Token is undefined, or failed sign a JWT token.
 * @route POST /auth/register
 * @access public 
 * @HazemSabry
 */
export const register_controller = async (req:Request<object, object, RegisterRequestBody>, res:Response, next:NextFunction):Promise<void> => {
    const { username, email, password }:RegisterRequestBody = req.body;

    try {
        const existingUsername: IUser | null = await User.findOne<IUser>({ username: username });
        if (existingUsername) {
            res.status(409).json({ message: 'Username already exists' });
            return;
        }
        const existingUser:IUser | null = await User.findOne<IUser>({ email: email });
        if (existingUser) {
            res.status(409).json({ message: 'Email already used before' });
            return;
        }

        if (!username || !email || !password) {
            res.status(406).json({ message: "Not accepted, missing parameter" });
            return;
        } else if (username.indexOf('@') !== -1) {
            res.status(406).json({ message: 'Invalid username can not include "@"' });
            return;
        } else if (email.length < 6 || email.indexOf('@') === -1) {
            res.status(406).json({ message: 'Invalid email format' });
            return
        }
        else if (password.length < 6) {
            res.status(406).json({ message: 'Password must be at least 6 characters long' });
            return
        }
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password)) {
            res.status(406).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
            return;
        }

        const hashedPassword:string = await bcrypt.hash(password, 12);
        const newUser:IUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const refreshToken: string = jwt.sign({ id: newUser._id, username: newUser.username, email: newUser.email }, secretKey, { expiresIn: refreshTokenExpiresIn });
        const accessToken:string = jwt.sign({ id: newUser._id, username: newUser.username, email: newUser.email }, secretKey, { expiresIn: accessTokenExpiresIn });
        res.cookie('refreshToken', refreshToken, refreshToken_cookiesProperty);
        res.status(200).json({ accessToken })
    } catch (error) {
        next(error);
    }
}

/**
 * Controller function for user login.
 * @param req.body.usernameOrEmail The username or email of the user to login with.
 * @param req.body.password The password of the user to login with.
 * @returns A promise that resolves when the user is logged in successfully.
 * @throws { Error } - If there is an error fetching the user profile, or the password is failed to encrypt, or the environment variable JWT_Token is undefined, or failed sign a JWT token.
 * @route POST /auth/login
 * @access public 
 * @HazemSabry
 */
export const login_controller = async (req: Request<object, object, LoginRequestBody>, res:Response, next:NextFunction):Promise<void> => {
    const { usernameOrEmail, password }: LoginRequestBody = req.body;

    try {
        if (!usernameOrEmail || !password) {
            res.status(406).json({ message: "Not accepted, missing parameter" });
            return;
        };
        if (typeof usernameOrEmail !== 'string' || usernameOrEmail.trim() === '' || typeof password !== 'string' || password.trim() === '') {
            res.status(400).json({ message: "Invalid parameter: usernameOrEmail and password should be a non-empty string" });
            return;
        }

        let existingUser:IUser | null = null;
        if (usernameOrEmail.indexOf('@') === -1) {  //user login with username.
            const UserName:string = usernameOrEmail;
            existingUser = await User.findOne<IUser>({ username: UserName });
        } else if (usernameOrEmail.indexOf('@') !== -1) {   //user login with email.
            const UserEmail:string = usernameOrEmail;
            existingUser = await User.findOne<IUser>({ email: UserEmail });
        }

        if (!existingUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isMatch:boolean = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            res.status(500);
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const refreshToken: string = jwt.sign({ id: existingUser._id, username: existingUser.username, email: existingUser.email }, secretKey, { expiresIn: refreshTokenExpiresIn });
        //const accessToken:string = jwt.sign({ id: existingUser._id, username: existingUser.username, email: existingUser.email }, secretKey, { expiresIn: accessTokenExpiresIn });
        res.cookie('refreshToken', refreshToken, refreshToken_cookiesProperty);
        res.status(200).json({ username: existingUser.username });

    } catch (error) {
        next(error);
    }
}

/**
 * Controller function for refreshing the accessToken
 * @param req.cookies.refreshToken The refresh token to be used to refresh the accessToken.
 * @returns a promise that is resolved when the accessToken is refreshed.
 * @route GET /auth/refresh-token
 * @access public
 * @HazemSabry
 */

export const refreshToken_controller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            res.status(500);
            throw new Error('Server error, secret key not found, cannot refresh accessToken');
        }

        const refreshToken: string | undefined = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: 'Unauthorized, no refreshToken provided' });
            return; 
        }

        jwt.verify(refreshToken, secretKey, (err: unknown, decoded: unknown) => {
            if (err) {
                res.status(500);
                throw new Error('Server error, failed to verify refresh token');
            }
            if (!decoded ) {
                res.status(403).json({ message: 'Invalid refresh token' });
                return;
            }

            const user = decoded as IJwtSignPayload;
            const accessToken: string = jwt.sign({ id: user.id, username: user.username, email: user.email }, secretKey, { expiresIn: accessTokenExpiresIn });
            res.status(200).json({ accessToken });
        });

    } catch (err) {
        next(err);
    }
}

/**
 * Controller function for user logout.
 * @returns A promise that resolves when the user is logged out successfully.
 * @route DELETE /auth/logout
 * @access private
 * 
 * @HazemSabry
 */
export const logout_controller = async(req: Request, res:Response, next:NextFunction):Promise<void> => {
    try {
        const refreshToken: string | undefined = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: 'Unauthorized, no refreshToken provided' });
            return; 
        }

        res.clearCookie('refreshToken', refreshToken_cookiesProperty);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
}

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            callbackURL: "http://your-backend.com/auth/github/callback",
            scope: ["repo", "read:user"],
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done: (error: unknown, user?: {user: IUser}) => void) => {
            /**
             * Finds a user in the database by their GitHub ID.
             * 
             * @param profile.id - The GitHub ID of the user to search for.
             * @returns A promise that resolves to the user object if found, or `null` if no user is found.
             */
            let user = await User.findOne({ github: { Id: profile.id } });

            if (!user) {
                user = await User.create({
                    githubId: profile.id,
                    username: profile.username,
                    email: profile.emails?.[0]?.value || "",
                    accessToken, // Store GitHub token for API access
                });
            }

            done(null, { user });
        }
    )
);

/**
 * Middleware for authenticating users using GitHub OAuth strategy.
 * This utilizes the `passport.authenticate` method with the "github" strategy.
 * 
 * @constant
 * @type {RequestHandler}
 * @see {@link https://www.passportjs.org/packages/passport-github2/|Passport-GitHub Documentation}
 * 
 * @remarks
 * - The `session` option is set to `false` to disable session-based authentication.
 * - Ensure that the GitHub strategy is properly configured in your Passport setup.
 * 
 * @route POST /auth/github
 * @access public
 * 
 * @HazemSabry
 */
export const githubAuth_controller: RequestHandler = passport.authenticate("github", { session: false });

/**
 * Handles the GitHub OAuth callback and generates a refresh token for the authenticated user.
 *
 * @param req - The HTTP request object, expected to contain the authenticated user in `req.user`.
 * @param res - The HTTP response object used to send the response back to the client.
 *
 * @remarks
 * - If the user is not authenticated (`req.user` is undefined), a 401 status code is returned with an error message.
 * - If the JWT secret key is not found in the environment variables, a 500 status code is returned, and an error is thrown.
 * - A refresh token is generated using the user's ID, username, and email, and is signed with the secret key.
 * - The refresh token is sent as a cookie in the response, and the username is returned in the response body.
 *
 * @throws Will throw an error if the JWT secret key is not found in the environment variables.
 * 
 * @returns A JSON response containing the username of the authenticated user.
 * 
 * @route POST /auth/github/callback
 * @access public
 * 
 * @HazemSabry
 */
export const githubCallback_controller = async (req: Request, res: Response, next:NextFunction): Promise<void> => {
    try {
        const user: IUser | undefined = req.user as IUser | undefined;
        if (!user) {
            res.status(401).json({ message: "GitHub authentication failed" });
            return;
        }

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            res.status(500);
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const refreshToken: string = jwt.sign({ id: user._id, username: user.username, email: user.email }, secretKey, { expiresIn: refreshTokenExpiresIn });

        res.cookie("refreshToken", refreshToken, refreshToken_cookiesProperty);
            res.status(200).json({ username: user.username });
        }
    catch (error) {
        next(error);
    }
};
