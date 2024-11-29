const path = require('path');

const express = require('express');
const { createDeployment, getAllDeployments, deleteDeployments, getDeploymentsByProject , updateDeploymentStatus} = require(path.join(__dirname, '..', 'controller', 'deploymentController'));

const router = express.Router();

router.post('/:username/:projectName', createDeployment);
router.get('/:username', getAllDeployments);
router.delete('/:username/:projectName', deleteDeployments);
router.get('/:username/:projectName', getDeploymentsByProject);
router.put('/:username/:projectName', updateDeploymentStatus);

module.exports = router;