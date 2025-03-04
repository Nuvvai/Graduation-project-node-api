import express, { Router } from 'express';
import { createPipeline, triggerBuild, getBuildStatus, deletePipeline, stopBuild, updatePipelineScript } from '../controller/pipelineController';
const router: Router = express.Router();


router.post('/:projectName', createPipeline);

router.post('/:projectName/:pipelineName', triggerBuild);

router.get('/:projectName/:pipelineName/:buildNumber/status', getBuildStatus);

router.delete('/:projectName/:pipelineName', deletePipeline);

router.post('/:projectName/:pipelineName/:buildNumber', stopBuild);

router.put('/:projectName/:pipelineName', updatePipelineScript);

export default router;
