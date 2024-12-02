const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
    deploymentName: {
        type: 'string',
        required: true,
        trim: true
    },
    projectName: {
        type: 'string',
        ref: 'Project',
        required: true,
        trim: true
    },
    username: {
        type: 'string',
        ref: 'User',
        required: true,
        trim: true
    },
    status: {
        type: 'string',
        required: true,
        enum: ['No status', 'Failed', 'Succeeded']
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

module.exports = mongoose.model('Deployment', deploymentSchema)