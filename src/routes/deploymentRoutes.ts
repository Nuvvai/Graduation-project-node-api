import express, { Router } from 'express';
import { createDeployment, getAllDeployments, deleteDeployments, getDeploymentsByProject , deleteDeployment} from '../controller/deploymentController';

const router: Router = express.Router();

router.post('/:username/:projectName', createDeployment);

router.get('/:username', getAllDeployments);

router.delete('/:username/:projectName', deleteDeployments);

router.get('/:username/:projectName', getDeploymentsByProject);

// router.put('/:username/:projectName', updateDeploymentStatus);

router.delete('/:username/:projectName/:deploymentName', deleteDeployment);

export default router;