import { Schema, model, Document } from 'mongoose';

/**
 * Interface representing a User document.
 * 
 * @interface IUser
 * @extends {Document}
 * 
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {string} password - The password of the user.
 * @property {'user' | 'admin'} role - The role of the user, either 'user' or 'admin'.
 * @property {Date} createdAt - The date when the user was created.
 * 
 * @HazemSabry
 */
export interface IUser extends Document {
    /**
     * The username of the user.
     */
    username: string;
    /**
     * The email address of the user.
     */
    email: string;
    /**
     * The password of the user.
     */
    password: string;
    /**
     * The role of the user, either 'user' or 'admin'.
     */
    role: 'user' | 'admin';
    /**
     * The date when the user was created.
     */
    createdAt: Date;
}

/**
 * Schema for Users
 * @HazemSabry
 */
const userSchema = new Schema < IUser > ({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

export default model<IUser> ('User', userSchema);
