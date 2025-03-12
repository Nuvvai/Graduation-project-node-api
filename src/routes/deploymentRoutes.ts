import express, { Router } from 'express';
import { createDeployment, getAllDeployments, deleteDeployments, getDeploymentsByProject , deleteDeployment} from '../controller/deploymentController';

const router: Router = express.Router();

/**
 * Route for creating a deployment for a user.
 * @route POST /deployments/:username/:projectName
 */
router.post('/:username/:projectName', createDeployment);

/**
 * Route for retrieving all deployments for a specific user.
 * @route GET /deployments/:username
 */
router.get('/:username', getAllDeployments);

/**
 * Route for deleting all deployments for a specific user.
 * @route DELETE /deployments/:username
 */
router.delete('/:username/:projectName', deleteDeployments);

/**
 * Route for retrieving all deployments for a specific project.
 * @route GET /deployments/:username/:projectName
 */
router.get('/:username/:projectName', getDeploymentsByProject);

/**
 * Route for deleting a specific deployment by username, project name and deployment name.
 * @route DELETE /deployments/:username/:projectName/:deploymentName
 */
router.delete('/:username/:projectName/:deploymentName', deleteDeployment);

// router.put('/:username/:projectName', updateDeploymentStatus);

export default router;