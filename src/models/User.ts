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
 * Represents the schema details for a User model.
 * 
 * @property id - A unique identifier for the user. It is of type `String` and is marked as unique and sparse.
 * @property username - The username of the user. It is of type `String` and is marked as unique and sparse.
 * @property email - The email address of the user. It is of type `String` and is marked as unique and sparse.
 * @property accessToken - A unique access token for the user. It is of type `String` and is marked as unique.
 * 
 * @HazemSabry
 */
const details = {
        id: { type: String, unique: true, sparse: true },
        username: { type: String, unique: true, sparse: true  },
        email: { type: String, unique: true, sparse: true },
        accessToken: { type: String, unique: true },
}

/**
 * Represents the schema for a user in the application.
 * 
 * @property {string} username - The unique username of the user. This field is required.
 * @property {string} email - The unique email address of the user.
 * @property {string} [password] - The password of the user. This field is optional.
 * @property {any} github - Details related to the user's GitHub account.
 * @property {any} bitbuchet - Details related to the user's Bitbucket account.
 * @property {any} gitlab - Details related to the user's GitLab account.
 * @property {any} azureDevOps - Details related to the user's Azure DevOps account.
 * @property {string} role - The role of the user, which can either be 'user' or 'admin'. Defaults to 'user'.
 * @property {Date} createdAt - The date and time when the user was created. Defaults to the current date and time.
 * 
 * @HazemSabry
 */
const userSchema = new Schema < IUser > ({
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: false },
    github: details,
    bitbuchet: details,
    gitlab: details,
    azureDevOps: details,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

export default model<IUser> ('User', userSchema);