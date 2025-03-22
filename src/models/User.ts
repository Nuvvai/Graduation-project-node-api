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
 * @property {string} githubId - The GitHub user ID.
 * @property {string} githubUsername - The GitHub username.
 * @property {string} githubEmail - The GitHub email address.
 * @property {string} githubAccessToken - The GitHub access token.
 * @property {'user' | 'admin'} role - The role of the user, either 'user' or 'admin'.
 * @property {Date} createdAt - The date when the user was created.
 * 
 * @HazemSabry
 */
export interface IUser extends Document {
    /** The username of the user.*/
    username: string;
    /** The email address of the user.*/
    email: string;
    /** The password of the user.*/
    password?: string;
    /**The GitHub user ID.*/
    githubId: string;
    /**The GitHub username.*/
    githubUsername: string;
    /**The GitHub email address.*/
    githubEmail: string;
    /**The GitHub access token.*/
    githubAccessToken: string;
    /**The role of the user, either 'user' or 'admin'.*/
    role: 'user' | 'admin';
    /**The date when the user was created.*/
    createdAt: Date;
}

/**
 * Schema for Users
 * @HazemSabry
 */
const userSchema = new Schema < IUser > ({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: false },
    githubId: { type: String, unique: true },
    githubUsername: { type: String, unique: true },
    githubEmail: { type: String, unique: true },
    githubAccessToken: { type: String, unique: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

export default model<IUser> ('User', userSchema);