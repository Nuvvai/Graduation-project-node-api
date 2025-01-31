import bcrypt from 'bcryptjs';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import User, { IUser } from '../models/User';
interface RegisterRequestBody {
    username: string;
    email: string;
    password: string;
}

interface LoginRequestBody {
    usernameOrEmail: string;
    password: string;
}

/**
 * @author Hazem Sabry
 * @description Controller function for user registration.
 * @param req.name - The username of the register user.
 * @param req.email - The email of the register user.
 * @param req.password - The password of the register user.
 * @returns A promise that resolves when the registration is successful.
 * @throws { Error } if failed to encrypt the password, or create new user, or the environment variable JWT_Token is undefined, or failed sign a JWT token.
 * @route POST /auth/register
 * @access public 
 */
export const register_controller = async (req:Request<{}, {}, RegisterRequestBody>, res:Response, next:NextFunction):Promise<void> => {
    const { username, email, password }:RegisterRequestBody = req.body;

    try {
        const existingUser:IUser | null = await User.findOne<IUser>({ email: email });
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }

        if (!username || !email || !password) {
            res.status(406).json({ message: "Not accepted, missing parameter" });
            return;
        } else if (username.indexOf('@') !== -1) {
            res.status(406).json({ message: 'Invalid username can not include \"@\"' }); //not tested yet ...!!
            return;
        } else if (email.length < 6 || email.indexOf('@') === -1) {
            res.status(406).json({ message: 'Invalid email format' }); //not tested yet ...!!
            return
        }
        else if (password.length < 6) {
            res.status(406).json({ message: 'Password must be at least 6 characters long' });  //not tested yet ...!!
            return
        }
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password)) {
            res.status(406).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });  //not tested yet ...!!
            return;
        }

        const hashedPassword:string = await bcrypt.hash(password, 12);
        const newUser:IUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const refreshToken: string = jwt.sign({ id: newUser._id, username: newUser.username, email: newUser.email }, secretKey, { expiresIn: '1d' });
        const accessToken:string = jwt.sign({ id: newUser._id, username: newUser.username, email: newUser.email }, secretKey, { expiresIn: '15m' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ accessToken })
    } catch (error) {
        next(error);
    }
}

/**
 * @author Hazem Sabry
 * @description Controller function for user login.
 * @param req.nameOrEmail The username or email of the user to login with.
 * @param req.password The password of the user to login with.
 * @returns A promise that resolves when the user is logged in successfully.
 * @throws { Error } - If there is an error fetching the user profile, or the password is failed to encrypt, or the environment variable JWT_Token is undefined, or failed sign a JWT token.
 * @route POST /auth/login
 * @access public 
 */
export const login_controller = async (req: Request<{}, {}, LoginRequestBody>, res:Response, next:NextFunction):Promise<void> => {
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

        const refreshToken: string = jwt.sign({ id: existingUser._id, username: existingUser.username, email: existingUser.email }, secretKey, { expiresIn: '7d' });
        const accessToken:string = jwt.sign({ id: existingUser._id, username: existingUser.username, email: existingUser.email }, secretKey, { expiresIn: '15m' });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ accessToken })

    } catch (error) {
        next(error);
    }
}

/**
 * @author Hazem Sabry
 * @description Controller function for refreshing the accessToken
 * @param req.
 * @returns a promise that is resolved when the accessToken is refreshed.
 * @route POST /auth/refresh-token
 * @access public
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

        jwt.verify(refreshToken, secretKey, (err: any, decoded: any) => {
            if (err) {
                res.status(500);
                throw new Error('Server error, failed to verify refresh token');
            }
            if (!decoded ) {
                res.status(403).json({ message: 'Invalid refresh token' });
                return;
            }

            const user = decoded as { id: string; username: string , email: string};
            const accessToken: string = jwt.sign({ id: user.id, username: user.username, email: user.email }, secretKey, { expiresIn: '7d' });
            res.status(200).json({ accessToken });
        });

    } catch (err) {
        next(err);
    }
}

/**
 * @author Hazem Sabry
 * @description Controller function for user logout.
 * @returns A promise that resolves when the user is logged out successfully.
 * @route DELETE /auth/logout
 * @access private
 */
export const logout_controller = async(req: Request, res:Response, next:NextFunction):Promise<void> => {
    try {
        res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
}