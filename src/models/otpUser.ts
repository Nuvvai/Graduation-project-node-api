import mongoose from "mongoose";
import { sendVerificationEmail } from "../utils/emailSender";

export interface IotpUser extends Document {
    username: string;
    email: string;
    otp: string;
    createdAt: Date;
}

/**
 * @author Mennatallah Ashraf
 * @description Mongoose model for OTP users.
 */
const otpUserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60*5
    },
});

otpUserSchema.pre("save", async function (next) {
    if (this.isNew) {
        const success = await sendVerificationEmail(this.username, this.email, this.otp);
        if (!success) {
            return next(new Error("Failed to send verification email!"));
        }
    }
    next();
});

export default mongoose.model<IotpUser>('otpUser', otpUserSchema);
