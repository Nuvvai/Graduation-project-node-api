import nodemailer, { TransportOptions, SendMailOptions } from 'nodemailer';

/**
 * @author Mennatallah Ashraf
 * @description Function to send a verification email to a user.
 * @param username The username of the user
 * @param email The email of the user
 * @param otp The OTP to be sent to the user
 * @returns A promise that resolves to true if email is sent successfully, false otherwise
 */
export const sendVerificationEmail = async (
    username: string, 
    email: string, 
    otp: string
): Promise<boolean> => {    
    try{
        if (!process.env.NUVVAIEMAIL || !process.env.NUVVAIPASSWORD) {
            console.error("Email configuration missing: Email environment variables not set");
            return false;
        }
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            host: 'smtp.gmail.com',
            secure: true,
            auth: {
                user: process.env.NUVVAIEMAIL,
                pass: process.env.NUVVAIPASSWORD,
            },
        }as TransportOptions);
        const mailOptions: SendMailOptions = {
            from: `"Nuvvai Team" <${process.env.NUVVAIEMAIL}>`,
            to: email,
            subject: 'Nuvvai - Your OTP for Email Verification',
            text: `Dear ${username},\n\nYou must confirm your identity using this one-time pass code: ${otp}, note that this code will expire in 5 minutes.\n\nRegards,\n\nNuvvai Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your Email</h2>
                    <p>Dear <strong>${username}</strong>,</p>
                    <p>You must confirm your identity using this one-time pass code:</p>
                    <div style="background-color: #f5f5f5; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>Note that this code will expire in <strong>5 minutes</strong>.</p>
                    <p>If you didn't request this code, please ignore this email.</p>
                    <p>Regards,<br>Nuvvai Team</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        return true
    } catch (error) {
        return false;
    }
}


/**
 * @author Mennatallah Ashraf
 * @description Function to send a password reset confirmation email
 * @param username The username of the user
 * @param email The email of the user
 * @returns A promise that resolves to true if email is sent successfully, false otherwise
 */
export const sendPasswordResetConfirmation = async (
    username: string,
    email: string
): Promise<boolean> => {
    if (!process.env.NUVVAIEMAIL || !process.env.NUVVAIPASSWORD) {
        console.error("Email configuration missing: Email environment variables not set");
        return false;
    }
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: true,
            auth: {
                user: process.env.NUVVAIEMAIL,
                pass: process.env.NUVVAIPASSWORD,
            },
        } as TransportOptions);

        const mailOptions: SendMailOptions = {
            from: `"Nuvvai Team" <${process.env.NUVVAIEMAIL}>`,
            to: email,
            subject: 'Nuvvai - Password Reset Successful',
            text: `Dear ${username},\n\nYour password has been successfully reset. If you did not make this change, please contact our support team immediately.\n\nRegards,\nNuvvai Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Successful</h2>
                    <p>Dear <strong>${username}</strong>,</p>
                    <p>Your password has been successfully reset.</p>
                    <p style="color: #d9534f; font-weight: bold;">If you did not make this change, please contact our support team immediately.</p>
                    <p>Regards,<br>Nuvvai Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
};