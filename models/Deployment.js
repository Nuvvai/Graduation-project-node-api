const mongoose = require('mongoose');
const Project = require('./Project');

const deploymentSchema = new mongoose.Schema({
    projectName: {
        type: 'string',
        ref: 'Project',
        required: true,
        trim: true
    },
    username: {
        type: 'string',
        ref: 'User',
        required: true
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