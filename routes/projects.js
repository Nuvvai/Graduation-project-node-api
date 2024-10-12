const {createProject, getProjects} = require('../controller/projectController')
const express = require('express')
const router = express.Router();

router.post('/new', createProject)
router.get('/view', getProjects)

module.exports = router;