import mongoose, { Document } from 'mongoose';
import { sendVerificationEmail } from "../utils/emailSender";

export interface IotpUser extends Document {
    username: string;
    email: string;
    otp: string;
    attempts: number;
    createdAt: Date;
}

/**
 * @author Mennatallah Ashraf
 * @description Mongoose model for OTP users.
 */
/**
 * Schema definition for an OTP User in the database.
 * 
 * This schema is used to store information about users who are
 * undergoing OTP-based verification. It includes fields for
 * username, email, OTP, number of attempts, and creation time.
 * 
 * Fields:
 * - `username` (String): The username of the user. This field is required and will be trimmed.
 * - `email` (String): The email address of the user. This field is required, will be trimmed, and stored in lowercase.
 * - `otp` (String): The one-time password (OTP) for the user. This field is required.
 * - `attempts` (Number): The number of OTP verification attempts made by the user. Defaults to 0, with a minimum of 0 and a maximum of 3.
 * - `createdAt` (Date): The timestamp when the OTP was created. Defaults to the current date and time. This field is set to expire after 5 minutes (60 * 5 seconds).
 */
const otpUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required!"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        trim: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
        min: 0,
        max: 3
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*5
    },
});


otpUserSchema.pre<IotpUser>("save", async function (next) {
    if (this.isNew) {
        /**
         * Indicates whether the verification email was sent successfully.
         * 
         * @type {boolean}
         * @returns `true` if the email was sent successfully, otherwise `false`.
         */
        const success = await sendVerificationEmail(this.username, this.email, this.otp);
        if (!success) {
            return next(new Error("Failed to send verification email!"));
        }
    }
    next();
});

export default mongoose.model<IotpUser>('otpUser', otpUserSchema);
