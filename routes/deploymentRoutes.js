const path = require('path');
const express = require('express');
const { createDeployment, getAllDeployments, deleteDeployments, getDeploymentsByProject , deleteDeployment} = require(path.join(__dirname, '..', 'controller', 'deploymentController'));

const router = express.Router();

router.post('/:username/:projectName', createDeployment);
router.get('/:username', getAllDeployments);
router.delete('/:username/:projectName', deleteDeployments);
router.get('/:username/:projectName', getDeploymentsByProject);
// router.put('/:username/:projectName', updateDeploymentStatus);
router.delete('/:username/:projectName/:deploymentName', deleteDeployment);

module.exports = router;