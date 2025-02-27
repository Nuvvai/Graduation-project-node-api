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
        validate: {
            validator: function (value: string): boolean {
                //ensure the project name does not contain any whitespace
                return !/\s/.test(value);
            },
            message: "Project name must not contain spaces.",
        },
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
