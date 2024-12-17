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
const register_controller = async (req:Request<{}, {}, RegisterRequestBody>, res:Response, next:NextFunction) => {
    const { name, email, password }:RegisterRequestBody = req.body;

    try {
        const existingUser = await User.findOne<IUser>({ email: email });
        if (existingUser) return res.status(409).json({ message: 'User already exists' });

        if (!name || !email || !password) return res.status(406).json({ message: "Not accepted, missing parameter" });
        else if (name.indexOf('@') !== -1) return res.status(406).json({ message: 'Invalid name can not include \"@\"' }); //not tested yet ...!!
        else if (email.length < 6 || email.indexOf('@') === -1) return res.status(406).json({ message: 'Invalid email format' }); //not tested yet ...!!
        else if (password.length < 6) return res.status(406).json({ message: 'Password must be at least 6 characters long' });  //not tested yet ...!!
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password)) return res.status(406).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });  //not tested yet ...!!

        const hashedPassword:string = await bcrypt.hash(password, 12);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            res.status(201).json({ result: newUser });
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const token = jwt.sign({ id: newUser._id, name: newUser.name, email: newUser.email }, secretKey, { expiresIn: '1d' });
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
const login_controller = async (req: Request<{}, {}, LoginRequestBody>, res:Response, next:NextFunction) => {
    const { nameOrEmail, password }: LoginRequestBody = req.body;

    try {
        if (!nameOrEmail || !password) return res.status(406).json({ message: "Not accepted, missing parameter" });

        let existingUser;
        if (nameOrEmail.indexOf('@') === -1) {
            const UserName = nameOrEmail;
            existingUser = await User.findOne({ name: UserName });
        } else if (nameOrEmail.indexOf('@') !== -1) {
            const UserEmail = nameOrEmail;
            existingUser = await User.findOne({ email: UserEmail });
        }

        if (!existingUser) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            res.status(200).json({ result: existingUser })
            throw new Error('Server error, secret key not found, cannot send token');
        }

        const token = jwt.sign({ id: existingUser._id, name: existingUser.name, email: existingUser.email }, secretKey, { expiresIn: '1d' });
        res.cookie('jwt-token', token, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ result: existingUser })

    } catch (error) {
        next(error);
    }
}

module.exports = { register_controller, login_controller };