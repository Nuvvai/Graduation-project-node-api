const mongoose = require('mongoose');

const pipelineSchema = new mongoose.Schema({
    pipelineName: {
        type: 'string',
        required: true
    },
    username: {
        type: 'string',
        ref: 'User',
        required: true
    },
    projectName: {
        type: 'string',
        ref: 'Project',
        required: true
    },
    lastBuildNumber: {
        type: Number,
        default: 0
    },
    lastBuildStatus: {
        type: 'string',
        enum: ['SUCCESS', 'FAILURE', 'ABORTED', 'IN_PROGRESS', 'NOT_BUILT'],
        default: 'NOT_BUILT'
    },
    lastBuildTime: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pipeline', pipelineSchema);