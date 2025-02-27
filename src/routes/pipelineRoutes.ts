import { verifyToken } from '../middleware/verifyToken';
import express, { Router } from 'express';
import { createPipeline, triggerBuild, getBuildStatus, deletePipeline, stopBuild, updatePipelineScript } from '../controller/pipelineController';
const router: Router = express.Router();


/**
 * Route for creating a pipeline for a user and project.
 * @route POST /pipelines/:projectName
 */
router.post<{ projectName: string }>('/:projectName', verifyToken, createPipeline);

/**
 * Route for triggering a build for a specific pipeline.
 * @route POST /pipelines/:projectName/:pipelineName
 */
router.post<{ projectName: string, pipelineName: string }>('/:projectName/:pipelineName', verifyToken, triggerBuild);

/**
 * Route for retrieving the build status of a specific pipeline.
 * @route GET /pipelines/:projectName/:pipelineName/:buildNumber/status
 */
router.get<{ projectName: string, pipelineName: string, buildNumber: string }>('/:projectName/:pipelineName/:buildNumber/status', verifyToken, getBuildStatus);

/**
 * Route for deleting a specific pipeline by username, project name, and pipeline name.
 * @route DELETE /pipelines/:projectName/:pipelineName
 */
router.delete<{ projectName: string, pipelineName: string }>('/:projectName/:pipelineName', verifyToken, deletePipeline);

/**
 * Route for stopping a build of a specific pipeline.
 * @route POST /pipelines/:projectName/:pipelineName/:buildNumber
 */
router.post<{ projectName: string, pipelineName: string, buildNumber: string }>('/:projectName/:pipelineName/:buildNumber', verifyToken, stopBuild);

/**
 * Route for updating the pipeline script for a specific pipeline.
 * @route PUT /pipelines/:projectName/:pipelineName
 */
router.put<{ projectName: string, pipelineName: string }>('/:projectName/:pipelineName', verifyToken, updatePipelineScript);

export default router;
