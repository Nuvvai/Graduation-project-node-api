const express = require('express');
const deploymentController = require('../controller/deploymentController');

const router = express.Router();

router.post('/deployments', deploymentController.createDeployment);
router.get('/deployments', deploymentController.getAllDeployments);
router.delete('/deployments/:id', deploymentController.deleteDeployment);
router.get('/deployments/:id', deploymentController.getDeploymentById);
router.get('/deployment/project/:projectName', deploymentController.getDeploymentsByProject);


module.exports = router;