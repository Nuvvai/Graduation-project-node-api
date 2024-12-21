import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
    projectName: string;
    username: string;
    repositoryUrl: string;
    frontendFramework: 'React' | 'Angular' | 'Vue.js' | 'Wordpress' | 'Svelte' | 'Vanilla JS';
    backendFramework: 'Node.js' | 'Golang' | 'Laravel' | 'Flask' | 'Django';
    database: 'MongoDB' | 'Redis' | 'MySQL' | 'PostgreSQL' | 'SQLite';
    description?: string;
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
    frontendFramework: {
        type: String,
        required: true,
        enum: ['React', 'Angular', 'Vue.js', 'Wordpress', 'Svelte', 'Vanilla JS'],
    },
    backendFramework: {
        type: String,
        required: true,
        enum: ['Node.js', 'Golang', 'Laravel', 'Flask', 'Django'],
    },
    database: {
        type: String,
        required: true,
        enum: ['MongoDB', 'Redis', 'MySQL', 'PostgreSQL', 'SQLite'],
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IProject>('Project', projectSchema);
