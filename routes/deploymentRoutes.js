const express = require('express');
const deploymentController = require('../controller/deploymentController');

const router = express.Router();

router.post('/deployments', deploymentController.createDeployment);
router.get('/:username/deployments', deploymentController.getAllDeployments);
router.delete('/:username/:projectName/deployments', deploymentController.deleteDeployments);
router.get('/:username/:projectName/deployments', deploymentController.getDeploymentsByProject);


module.exports = router;