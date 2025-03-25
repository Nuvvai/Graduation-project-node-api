import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    projectName: string;
    username: string;
    repositoryUrl: string;
    framework: 'React' | 'Angular' | 'VueJS' | 'Wordpress' | 'Svelte' | 'VanillaJS'| 'NodeJS' | 'Golang' | 'Laravel' | 'Flask' | 'Django' | 'PHP';
    description?: string;
    // add them if needed
    // buildCommand: string;
    // startCommand: string;
    createdAt: Date;
}

/**
 * @author Mennatallah Ashraf
 * @description Mongoose model for projects.
 */
const projectSchema: Schema<IProject> = new Schema<IProject>({
    projectName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Project name must be at least 3 characters long."],
        maxlength: [30, "Project name must not exceed 30 characters."],
        validate: {
            validator: function (value: string): boolean {
                //ensure the project name does not contain any whitespace
                return !/\s/.test(value);
            },
            message: "Project name can only contain letters, numbers, and dashes.",
        }
    },
    username: {
        type: String,
        ref: 'User',
        required: true,
        trim: true,
    },
    repositoryUrl: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (value: string): boolean {
                //ensure the repository URL is a valid GitHub URL
                return /^https:\/\/github.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+$/.test(value);
            },
            message: "Repository URL must be a valid GitHub URL.",
        },
    },
    framework: {
        type: String,
        required: true,
        enum: ['React', 'Angular', 'VueJS', 'Wordpress', 'Svelte', 'VanillaJS', 'NodeJS', 'Golang', 'Laravel', 'Flask', 'Django', 'PHP'],
    },
    description: {
        type: String,
    },
    // buildCommand:{
    //     type: String,
    //     required: true,
    // },
    // startCommand:{
    //     type: String,
    //     required: true,
    // },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IProject>('Project', projectSchema);
