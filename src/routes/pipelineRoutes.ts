import express, { Router } from 'express';
import { createPipeline, triggerBuild, getBuildStatus, deletePipeline, stopBuild, updatePipelineScript } from '../controller/pipelineController';
const router: Router = express.Router();

/**
 * Route for creating a pipeline for a user and project.
 * @route POST /pipelines/:username/:projectName
 */
router.post('/:username/:projectName', createPipeline);

/**
 * Route for triggering a build for a specific pipeline.
 * @route POST /pipelines/:username/:projectName/:pipelineName
 */
router.post('/:username/:projectName/:pipelineName', triggerBuild);

/**
 * Route for retrieving the build status of a specific pipeline.
 * @route GET /pipelines/:username/:projectName/:pipelineName/:buildNumber/status
 */
router.get('/:username/:projectName/:pipelineName/:buildNumber/status', getBuildStatus);

/**
 * Route for deleting a specific pipeline by username, project name, and pipeline name.
 * @route DELETE /pipelines/:username/:projectName/:pipelineName
 */
router.delete('/:username/:projectName/:pipelineName', deletePipeline);

/**
 * Route for stopping a build of a specific pipeline.
 * @route POST /pipelines/:username/:projectName/:pipelineName/:buildNumber
 */
router.post('/:username/:projectName/:pipelineName/:buildNumber', stopBuild);

/**
 * Route for updating the pipeline script for a specific pipeline.
 * @route PUT /pipelines/:username/:projectName/:pipelineName
 */
router.put('/:username/:projectName/:pipelineName', updatePipelineScript);

export default router;
