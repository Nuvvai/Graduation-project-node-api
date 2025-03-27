import nodemailer, { TransportOptions, SendMailOptions } from 'nodemailer';

/**
 * @author Mennatallah Ashraf
 * @description Function to send a verification email to a user.
 * @param username The username of the user
 * @param email The email of the user
 * @param otp The OTP to be sent to the user
 * @returns A promise that resolves when the email is sent successfully
 */
export const sendVerificationEmail = async (
    username: string, 
    email: string, 
    otp: string
): Promise<boolean> => {    
    try{
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NUVVAIEMAIL,
                pass: process.env.NUVVAIPASSWORD,
            },
        }as TransportOptions);
        const mailOptions: SendMailOptions = {
            from: process.env.NUVVAIEMAIL,
            to: email,
            subject: 'Nuvvai - Your OTP for Email Verification',
            text: `Dear ${username},\n\nYou must confirm your identity using this one-time pass code: ${otp}, note that this code will expire in 5 minutes.\n\nRegards,\n\nNuvvai Team`,
        };
        await transporter.sendMail(mailOptions);
        return true
    } catch (error) {
        return false;
    }
}
