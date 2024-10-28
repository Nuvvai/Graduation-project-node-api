const mongoose = require('mongoose');
const Project = require('./Project');

const deploymentSchema = new mongoose.Schema({
    projectName: {
        type: String,
        ref: 'Project',
        required: true,
        validate: {
            validator: async function(projectName) {
              const project = await mongoose.model('Project').findOne({ projectName });
              return project !== null;
            },
            message: 'Project with this name does not exist'
        }
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