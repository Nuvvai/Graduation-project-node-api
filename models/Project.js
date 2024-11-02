const mongoose = require('mongoose');
// const User = require('./User')

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  repositoryUrl: {
    type: String,
    required: true,
    unique: true
  },
  frontendFramework: {
    type: 'string',
    required: true
  },
  backendFramework: {
    type: 'string',
    required: true
  },
  database: {
    type: 'string',
    required: true
  },
  description: {
    type: 'string'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Project', projectSchema);
