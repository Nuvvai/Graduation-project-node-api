const path = require('path');

const { createProject, getAllProjects, deleteProject, deleteAllProjects } = require(path.join(__dirname, '..', 'controller', 'projectController'))
const express = require('express')
const router = express.Router();

router.post('/', createProject)
router.get('/', getAllProjects)
router.delete('/:projectName', deleteProject);
router.delete('/', deleteAllProjects);

module.exports = router;