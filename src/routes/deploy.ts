import express, { Router } from 'express';
import { deployProject } from '../controller/deploy';

const router: Router = express.Router();

/**
 * Route for deploying a project.
 * @route POST /deploy/
 * @access private
 */
router.post('/', deployProject);

export default router;