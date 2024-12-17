const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: {
    type: 'string',
    required: true,
    trim: true,
    validate: {
      validator: function (value) {
        // Ensure the project name does not contain any whitespace
        return !/\s/.test(value);
      },
      message: "Project name must not contain spaces.",
    },
  },
  username: {
    type: 'string',
    ref: 'User',
    required: true,
    trim: true
  },
  repositoryUrl: {
    type: 'string',
    required: true,
    unique: true
  },
  frontendFramework: {
    type: 'string',
    required: true,
    enum: ['React', 'Angular', 'Vue.js', 'Wordpress', 'Svelte', 'Vanilla JS']
  },
  backendFramework: {
    type: 'string',
    required: true,
    enum: ['Node.js', 'Golang', 'Laravel', 'Flask', 'Django']
  },
  database: {
    type: 'string',
    required: true,
    enum: ['MongoDB', 'Redis', 'MySQL', 'PostgreSQL', 'SQLite']
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
