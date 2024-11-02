const path = require('path');

const express = require('express');
const { createDeployment, getAllDeployments, deleteDeployments, getDeploymentsByProject } = require(path.join(__dirname, '..', 'controller', 'deploymentController'));

const router = express.Router();

router.post('/', createDeployment);
router.get('/:username', getAllDeployments);
router.delete('/:username/:projectName', deleteDeployments);
router.get('/:username/:projectName', getDeploymentsByProject);


module.exports = router;