import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import User from '../models/User';
import { IUser } from './../models/User';

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
 * @des Controller function for user registration.
 * @route GET /auth/register
 * @access public 
 */
export const register_controller = async (req:Request<{}, {}, RegisterRequestBody>, res:Response, next:NextFunction):Promise<void> => {
    const { name, email, password }:RegisterRequestBody = req.body;

    try {
        const existingUser = await User.findOne<IUser>({ email: email });
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
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            res.status(201).json({ result: newUser });
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const token = jwt.sign({ id: newUser._id, name: newUser.username, email: newUser.email }, secretKey, { expiresIn: '1d' });
        res.cookie('jwt-token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ result: newUser });
    } catch (error) {
        next(error);
    }
}

/**
 * @author Hazem Sabry
 * @des Controller function for user login.
 * @route GET /auth/login
 * @access public 
 */
export const login_controller = async (req: Request<{}, {}, LoginRequestBody>, res:Response, next:NextFunction):Promise<void> => {
    const { nameOrEmail, password }: LoginRequestBody = req.body;

    try {
        if (!nameOrEmail || !password) res.status(406).json({ message: "Not accepted, missing parameter" });

        let existingUser;
        if (nameOrEmail.indexOf('@') === -1) {
            const UserName = nameOrEmail;
            existingUser = await User.findOne({ name: UserName });
        } else if (nameOrEmail.indexOf('@') !== -1) {
            const UserEmail = nameOrEmail;
            existingUser = await User.findOne({ email: UserEmail });
        }

        if (!existingUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            res.status(200).json({ result: existingUser })
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const token = jwt.sign({ id: existingUser._id, name: existingUser.username, email: existingUser.email }, secretKey, { expiresIn: '1d' });
        res.cookie('jwt-token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ result: existingUser })

    } catch (error) {
        next(error);
    }
}