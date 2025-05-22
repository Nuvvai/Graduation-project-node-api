import mongoose, { Document, Schema } from 'mongoose';

export interface IDeployment extends Document {
    deploymentName: string;
    projectName: string;
    username: string;
    status: 'No status' | 'Failed' | 'Succeeded';
    startTime: Date;
    endTime: Date;
}

/**
 * @author Mennatallah Ashraf
 * @description Mongoose model for deployments.
 */
/**
 * Schema definition for the Deployment model.
 *
 * This schema represents the structure of a deployment document in the database.
 * It includes fields for deployment details, associated project and user,
 * status, and timestamps.
 * 
 */
const deploymentSchema: Schema<IDeployment> = new Schema<IDeployment>({
    deploymentName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Deployment name must be at least 3 characters long."],
        maxlength: [50, "Deployment name must not exceed 50 characters."],
        validate: {
            validator: function (value: string): boolean {
                return /^[a-zA-Z0-9-]+$/.test(value); // Alphanumeric + dashes only
            },
            message: "Deployment name can only contain letters, numbers, and dashes.",
        }
    },
    projectName: {
        type: String,
        ref: 'Project',
        required: true,
        trim: true
    },
    username: {
        type: String,
        ref: 'User',
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['No status', 'Failed', 'Succeeded'],
        default: 'No status'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IDeployment>('Deployment', deploymentSchema);