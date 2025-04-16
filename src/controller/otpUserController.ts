import { generateUniqueOtp } from '../utils/generateOtp';
import otpUser, {IotpUser} from '../models/otpUser';
import User, {IUser} from '../models/User';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import Validate from '../utils/Validate';

interface sendOtpRequestBody {
    username?: string;
    email: string;
}

interface verifyOtpRequestBody {
    email: string;
    otp: string;
}

interface resetPasswordRequestBody {
    email: string;
    newPassword: string;
}


/**
 * @author Mennatallah Ashraf
 * @des Controller function for sending an OTP to a user.
 * @route POST /auth/sendOtp
 * @access public
 */
export const sendOTP = async (
    req: Request<{}, {}, sendOtpRequestBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    let { username, email } = req.body;
    const reason = req.query.reason as string | undefined;
    try{
        const userExists = await User.findOne<IUser>({ email });
        if (userExists && reason === undefined) {
            res.status(409).json({ message: 'User is already registered!' });
            return;
        }
        if (!userExists && reason === "forgotPassword") {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        if(!username && reason === undefined){
            res.status(400).json({ message: 'Username is required!' });
            return;
        }
        if(reason === "forgotPassword"){
            username = userExists?.username;
        }
        const otp = await generateUniqueOtp();
        const otpPayload = { username, email, otp };
        await otpUser.create(otpPayload);
        res.status(200).json({message: 'OTP sent successfully!'});
    } catch (error) {
        next(error);
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for verifying an OTP sent to a user.
 * @route POST /auth/verifyOtp
 * @access public
 */
export const verifyOTP = async (
    req: Request<{}, {}, verifyOtpRequestBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    const { email, otp } = req.body;
    try {
        const otpUserExists = await otpUser.findOne<IotpUser>({ email, otp }).sort({ createdAt: -1 }).limit(1);
        if (!otpUserExists) {
            res.status(400).json({ message: 'Invalid OTP!' });
            return;
        }
        await otpUser.deleteOne({ email, otp });
        res.status(200).json({ message: 'OTP verified successfully!' });
    } catch (error) {
        next(error);
    }
}

/**
 * @author Mennatallah Ashraf
 * @des Controller function for resetting a user's password.
 * @route PUT /auth/resetPassword
 * @access public
 */
export const resetPassword = async (
    req: Request<{}, {}, resetPasswordRequestBody>, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
    const { email, newPassword } = req.body;
    const validate = new Validate(res);
    try {
        const userExists = await User.findOne<IUser>({ email });
        if (!userExists) {
            res.status(404).json({ message: 'User not found!' });
            return;
        }
        validate.passwordSyntax(newPassword)
        const hashedPassword:string = await bcrypt.hash(newPassword, 12);
        userExists.password = hashedPassword;
        await userExists.save();
        res.status(200).json({ message: "Password reset successful!" });
    } catch (error) {
        next(error);
    }
};