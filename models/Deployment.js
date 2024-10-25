const mongoose = require('mongoose');
const Project = require('./Project');

const deploymentSchema = new mongoose.Schema({
    deploymentId: {
        type: String,
        required: true,
        unique: true
    },
    projectName: {
        type: String,
        ref: 'Project',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['No status', 'Waiting', 'Failed', 'Succeeded']
    },
    startTime: Date,
    endTime: Date
});

module.exports = mongoose.model('Deployment', deploymentSchema)