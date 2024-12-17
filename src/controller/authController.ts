import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import User, { IUser } from '../models/User';
interface RegisterRequestBody {
    name: string;
    email: string;
    password: string;
}

interface LoginRequestBody {
    nameOrEmail: string;
    password: string;
}

/**
 * @author Hazem Sabry
 * @description Controller function for user registration.
 * @param req.name - The name of the register user.
 * @param req.email - The email of the register user.
 * @param req.password - The password of the register user.
 * @returns A promise that resolves when the registration is successful.
 * @throws { Error } if failed to encrypt the password, or create new user, or the environment variable JWT_Token is undefined, or failed sign a JWT token.
 * @route GET /auth/register
 * @access public 
 */
export const register_controller = async (req:Request<{}, {}, RegisterRequestBody>, res:Response, next:NextFunction):Promise<void> => {
    const { name, email, password }:RegisterRequestBody = req.body;

    try {
        const existingUser:IUser | null = await User.findOne<IUser>({ email: email });
        if (existingUser) {
            res.status(409).json({ message: 'User already exists' });
            return;
        }

        if (!name || !email || !password) {
            res.status(406).json({ message: "Not accepted, missing parameter" });
            return;
        } else if (name.indexOf('@') !== -1) {
            res.status(406).json({ message: 'Invalid name can not include \"@\"' }); //not tested yet ...!!
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
        const newUser:IUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            res.status(201).json({ result: newUser });
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const token:string = jwt.sign({ id: newUser._id, name: newUser.name, email: newUser.email }, secretKey, { expiresIn: '1d' });
        res.cookie('jwt-token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ result: newUser });
    } catch (error) {
        next(error);
    }
}

/**
 * @author Hazem Sabry
 * @description Controller function for user login.
 * @param req.nameOrEmail The name or email of the user to login with.
 * @param req.password The password of the user to login with.
 * @returns A promise that resolves when the user is logged in successfully.
 * @throws { Error } - If there is an error fetching the user profile, or the password is failed to encrypt, or the environment variable JWT_Token is undefined, or failed sign a JWT token.
 * @route GET /auth/login
 * @access public 
 */
export const login_controller = async (req: Request<{}, {}, LoginRequestBody>, res:Response, next:NextFunction):Promise<void> => {
    const { nameOrEmail, password }: LoginRequestBody = req.body;

    try {
        if (!nameOrEmail || !password) res.status(406).json({ message: "Not accepted, missing parameter" });

        let existingUser:IUser | null = null;
        if (nameOrEmail.indexOf('@') === -1) {  //user login with username.
            const UserName:string = nameOrEmail;
            existingUser = await User.findOne({ name: UserName });
        } else if (nameOrEmail.indexOf('@') !== -1) {   //user login with email.
            const UserEmail:string = nameOrEmail;
            existingUser = await User.findOne({ email: UserEmail });
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
            res.status(200).json({ result: existingUser })
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const token:string = jwt.sign({ id: existingUser._id, name: existingUser.name, email: existingUser.email }, secretKey, { expiresIn: '1d' });
        res.cookie('jwt-token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ result: existingUser })

    } catch (error) {
        next(error);
    }
}