const mongoose = require('mongoose');
const Project = require('./Project')

const pipelineSchema = new mongoose.Schema({
    projectName: {
        type: String,
        ref: 'Project',
        required: true
    },
    username: {
        type: 'string',
        ref: 'User',
        required: true
    },
    stages: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Pipeline', pipelineSchema)