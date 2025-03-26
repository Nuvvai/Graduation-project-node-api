import { Schema, model, Document } from 'mongoose';

/**
 * Represents the schema for a GitHub user.
 * @interface IGitHubUserSchema
 * @property {string} id - The github ID of the user.
 * @property {string} username - The github name of the user.
 * @property {string} email - The github email of the user.
 * @property {string} accessToken - The github access token of the user.
 * 
 * @HazemSabry
 */
interface IRepositoryProviderSchema {
    /**The user ID.*/
    id: string;
    /**The username.*/
    username: string;
    /**The email address.*/
    email: string;
    /**The access token.*/
    accessToken: string;
}

/**
 * Interface representing a User document.
 * 
 * @interface IUser
 * @extends {Document}
 * 
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {string} password - The password of the user.
 * @property {string} github - The github Information of the user.
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
    /**The github Information of the user*/
    github?: IRepositoryProviderSchema
    /**The gitlab Information of the user*/
    gitlab?: IRepositoryProviderSchema
    /**The bitbuchet Information of the user*/
    bitbuchet?: IRepositoryProviderSchema
    /**The azureDevOps Information of the user*/
    azureDevOps?: IRepositoryProviderSchema
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
    github: {
        id: { type: String, unique: true, sparse: true },
        username: { type: String, unique: true, sparse: true  },
        email: { type: String, unique: true, sparse: true },
        accessToken: { type: String, unique: true },
    },
    bitbuchet: {
        id: { type: String, unique: true, sparse: true },
        username: { type: String, unique: true, sparse: true  },
        email: { type: String, unique: true, sparse: true },
        accessToken: { type: String, unique: true },
    },
    gitlab: {
        id: { type: String, unique: true, sparse: true },
        username: { type: String, unique: true, sparse: true  },
        email: { type: String, unique: true, sparse: true },
        accessToken: { type: String, unique: true },
    },
    azureDevOps: {
        id: { type: String, unique: true, sparse: true },
        username: { type: String, unique: true, sparse: true  },
        email: { type: String, unique: true, sparse: true },
        accessToken: { type: String, unique: true },
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

export default model<IUser> ('User', userSchema);