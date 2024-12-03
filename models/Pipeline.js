const mongoose = require('mongoose');

const jenkinsStageSchema = new mongoose.Schema({
    name: {
        type: 'string',
        required: true
    },
    steps: [{
        name: 'string',
        command: 'string',
        args: ['string']
    }],
    timeout: {
        type: Number,
        default: 3600 //default timeout in seconds (1 hour)
    },
    retryCount: {
        type: Number,
        default: 0
    }
});

const pipelineSchema = new mongoose.Schema({
    projectName: {
        type: 'string',
        ref: 'Project',
        required: true
    },
    jenkinsJobName: {
        type: 'string',
        required: true,
        unique: true
    },
    jenkinsUrl: {
        type: 'string',
        required: true
    },
    credentialsId: {
        type: 'string',
        required: true
    },
    sourceControl: {
        type: {
            type: 'string',
            enum: ['git', 'svn'],
            default: 'git'
        },
        repository: 'string',
        branch: {
            type: 'string',
            default: 'main'
        }
    },
    stages: [jenkinsStageSchema],
    environment: [{
        key: 'string',
        value: 'string'
    }],
    triggers: {
        webhook: {
            type: Boolean,
            default: true
        },
        cron: 'string' // Jenkins cron syntax
    },
    notifications: {
        email: {
            recipients: ['string'],
            onSuccess: {
                type: Boolean,
                default: false
            },
            onFailure: {
                type: Boolean,
                default: true
            }
        },
        slack: {
            channel: 'string',
            webhook: 'string'
        }
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