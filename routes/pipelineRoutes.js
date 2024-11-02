const path = require('path');

const { createPipeline, triggerBuild, getBuildStatus, getBuildLogs, updatePipeline, stopBuild, deletePipeline } = require(path.join(__dirname, '..', 'controller', 'pipelineController'));
const express = require('express');

const router = express.Router();

router.post('/', createPipeline);
router.delete('/:id', deletePipeline)
//TODO: implement the remaining routes

module.exports = router;
