import mongoose, { Document, Schema } from 'mongoose';

type FrameworkType = 'React' | 'Angular' | 'VueJS' | 'Wordpress' | 'Svelte' | 'VanillaJS' | 'NodeJS' | 'Golang' | 'Laravel' | 'Flask' | 'Django' | 'PHP';

export interface IProject extends Document {
    projectName: string;
    username: string;
    repositoryUrl: string;
    framework: FrameworkType;
    description?: string;
    orgRepositoryUrl?: string;
    dockerfileContent?: string;
    k8sManifestContent?: string;
    testCommand?: string; //unit test command
    createdAt: Date;
}

/**
 * @author Mennatallah Ashraf
 * @description Mongoose model for projects.
 */
/**
 * Schema definition for the Project model.
 * 
 * This schema represents the structure of a project document in the database.
 * It includes fields for project details, associated user, repository URLs, 
 * framework, and additional metadata.
 * 
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
                return /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/.test(value);
            },
            message: "Repository URL must be a valid GitHub repository URL.",
        }        
    },
    framework: {
        type: String,
        required: true,
        enum: ['React', 'Angular', 'VueJS', 'Wordpress', 'Svelte', 'VanillaJS', 'NodeJS', 'Golang', 'Laravel', 'Flask', 'Django', 'PHP'],
    },
    description: {
        type: String,
    },
    orgRepositoryUrl: {
        type: String,
        validate: {
            validator: function (value: string): boolean {
                return /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(?:\.git)?$/.test(value);
            },
            message: "Organization Repository URL must be a valid GitHub repository URL.",
        }
    },
    dockerfileContent: {
        type: String,
        default: '',
    },
    k8sManifestContent: {
        type: String,
        default: '',
    },
    testCommand: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});


export default mongoose.model<IProject>('Project', projectSchema);
