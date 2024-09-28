const mongoose = require('mongoose');
const projectTechnicalDetailsSchema = require('projectTechnicalDetailsSchema');

const projectTechnicalDetailsSchema = new mongoose.Schema({
    technicalStack: { type: 'string', required: true, enum: ['frontend', 'backend', 'database'] },
    programLanguage: { type: 'string', required: true },
    frameWork: { type: 'string', required: true },
    repoURL: { type: 'string' },
});

const projectSchema = new mongoose.Schema({
    projectName: { type: 'string', required: true },
    description: { type: 'string' },
    technicalDetails: projectTechnicalDetailsSchema,
    startDate: { type: 'date', required: true },
    endDate: { type: 'date', required: true },
    status: { type: 'string', required: true, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: 'date', default: Date.now },
});

module.exports = projectSchema;