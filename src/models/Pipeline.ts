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
    },
    username: {
        type: String,
        ref: 'User',
        required: true,
    },
    projectName: {
        type: String,
        ref: 'Project',
        required: true,
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
