import express, { Router } from 'express';
import { deployProject } from '../controller/deploy';

const router: Router = express.Router();

/**
 * Route for deploying a project.
 * @route POST /deploy/:username/:projectName
 * @access private
 */
router.post('/:username/:projectName', deployProject);

export default router;