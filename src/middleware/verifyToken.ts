import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";
import { IJwtSignPayload } from '../controller/authController';
import { console } from 'inspector';

/**
 * Verify the access token for authorize user.
 * @param req.headers.authorization
 * @param res 
 * @param next 
 * @throws { Error } If the process.env.JWT_Token is not undefined.
 * @returns A promise that resolves when the user is authorized.
 * @HazemSabry
 */
export const verifyToken = async(req:Request, res:Response, next:NextFunction): Promise<void> => {
    const accessToken = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer <token>"
    console.log(accessToken);
    
    if (!accessToken) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
    }

    try {
        const secretKey: string | undefined = process.env.JWT_Token;
        if (!secretKey) {
            throw new Error('Server error, secret key not found, cannot refresh accessToken');
        }

        jwt.verify(accessToken, secretKey, (err: unknown, decoded: unknown) => {
            if (err) {
                // console.error("JWT Verification Error:", err);
                res.status(403).json({ message: "Invalid or expired access token" });
                return;
            }
            if (!decoded ) {
                res.status(403).json({ message: 'Invalid refresh token' });
                return;
            }
        
            console.log("decoded:"+decoded);
            req.user = decoded as IJwtSignPayload; // Attach decoded user data to request object
            next();
        });
    } catch (error) {
        console.log((error as Error).message);
        res.status(500);
    }

};
