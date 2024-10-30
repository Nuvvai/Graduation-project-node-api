const mongoose = require('mongoose');
const User = require('./User')

const projectSchema = new mongoose.Schema({
  projectName: {
    type: 'string',
    required: true,
    unique: true,
    trim: true
  },
  username: {
    type: 'string',
    ref: 'User',
    required: true
  },
  repositoryUrl: {
    type: 'string',
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  framework: 'string',
  description: 'string'
});

module.exports = mongoose.model('Project', projectSchema);
