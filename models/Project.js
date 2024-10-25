const mongoose = require('mongoose');
const User = require('./User')

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // rewrite later
  // username: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true,
  // },
  repositoryUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  framework: String
});

module.exports = mongoose.model('Project', projectSchema);
