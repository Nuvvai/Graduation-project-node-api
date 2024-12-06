const path = require('path');

const { createPipeline, triggerBuild, getBuildStatus, deletePipeline } = require(path.join(__dirname, '..', 'controller', 'pipelineController'));
const express = require('express');

const router = express.Router();

router.post('/:username/:projectName', createPipeline);
router.post('/:username/:projectName/:pipelineName', triggerBuild)
router.get('/:username/:projectName/:pipelineName/:buildNumber/status', getBuildStatus)
router.delete('/:username/:projectName/:pipelineName', deletePipeline);
//TODO: implement the remaining routes

module.exports = router;
