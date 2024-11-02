const projectController = require('../controller/projectController')
const express = require('express')
const router = express.Router();

router.post('/projects', projectController.createProject)
router.get('/projects/:username', projectController.getAllProjects)
router.delete('/projects', projectController.deleteProject);
router.delete('/projects/:username', projectController.deleteAllProjects);

module.exports = router;