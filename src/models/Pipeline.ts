import mongoose, { Schema, Document } from 'mongoose';

export interface IPipeline extends Document {
    pipelineName: string;
    username: string;
    projectName: string;
    lastBuildNumber: number;
    lastBuildTime?: Date;
    createdAt?: Date;
}

/**
 * @author Mennatallah Ashraf
 * @description Mongoose model for pipelines.
 */
const pipelineSchema: Schema = new Schema<IPipeline>({
    pipelineName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "Pipeline name must be at least 3 characters long."],
        maxlength: [50, "Pipeline name must not exceed 50 characters."],
        validate: {
            validator: function (value: string): boolean {
                return /^[a-zA-Z0-9-]+$/.test(value); // Alphanumeric + dashes only
            },
            message: "Pipeline name can only contain letters, numbers, and dashes.",
        }
    },
    username: {
        type: String,
        ref: 'User',
        required: true,
        trim: true
    },
    projectName: {
        type: String,
        ref: 'Project',
        required: true,
        trim: true
    },
    lastBuildNumber: {
        type: Number,
        default: 0,
    },
    // lastBuildStatus: {
    //     type: String,
    //     enum: ['SUCCESS', 'FAILURE', 'ABORTED', 'IN_PROGRESS', 'NOT_BUILT'],
    //     default: 'NOT_BUILT',
    // },
    lastBuildTime: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model<IPipeline>('Pipeline', pipelineSchema);
