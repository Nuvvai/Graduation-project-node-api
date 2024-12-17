const path = require('path');

const { createProject, getAllProjects, deleteProject, deleteAllProjects } = require(path.join(__dirname, '..', 'controller', 'projectController'))
const express = require('express')
const router = express.Router();

router.post('/:username', createProject)
router.get('/:username', getAllProjects)
router.delete('/:username/:projectName', deleteProject);
router.delete('/:username', deleteAllProjects);

module.exports = router;