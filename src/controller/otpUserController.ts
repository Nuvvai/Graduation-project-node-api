import otpGenerator from 'otp-generator';
import otpUser from '../models/otpUser';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';

interface sendOtpRequestBody {
    username: string;
    email: string;
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for sending an OTP to a user.
 * @route POST /auth/sendOtp
 * @access public
 */
export const sendOtp = async (req: Request<{}, {}, sendOtpRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { username, email } = req.body;
    try{
        const userExists = await User.findOne({ username, email });
        if (userExists) {
            res.status(409).json({ message: 'User is already registered!' });
            return;
        }
        let otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
        let result = await otpUser.findOne({otp: otp})
        while (result) {
            otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            });
            result = await otpUser.findOne({ otp: otp });
        }
        const otpPayload = { username, email, otp };
        await otpUser.create(otpPayload);
        res.status(200).json({message: 'OTP sent successfully!'});
    } catch (error) {
        next(error);
    }
}
