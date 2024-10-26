const mongoose = require('mongoose');
const Project = require('./Project');

const deploymentSchema = new mongoose.Schema({
    projectName: {
        type: String,
        ref: 'Project',
        required: true,
        validate: {
            validator: async function(name) {
              const project = await mongoose.model('Project').findOne({ name });
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