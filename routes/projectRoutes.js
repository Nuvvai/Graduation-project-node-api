const projectController = require('../controller/projectController')
const express = require('express')
const router = express.Router();

router.post('/projects', projectController.createProject)
router.get('/projects', projectController.getAllProjects)

module.exports = router;