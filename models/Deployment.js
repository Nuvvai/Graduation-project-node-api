const mongoose = require('mongoose');

const deploymentSchema = new mongoose.Schema({
    deploymentName: {
        type: 'string',
        required: true,
        trim: true,
        validate: {
            validator: function (value) {
              // Ensure the deployment name does not contain any whitespace
              return !/\s/.test(value);
            },
            message: "Deployment name must not contain spaces.",
        },
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