const path = require('path');

const { createPipeline } = require(path.join(__dirname, '..', 'controller', 'pipelineController'));
const express = require('express');

const router = express.Router();

router.post('/:username/:projectName', createPipeline);
//TODO: implement the remaining routes

module.exports = router;
