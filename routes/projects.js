const {createProject, getProjects} = require('../controller/projectController')
const express = require('express')
const router = express.Router();

router.post('/projects', createProject)
router.get('/projects', getProjects)

module.exports = router;