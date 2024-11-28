const path = require('path');

const express = require('express');
const { createDeployment, getAllDeployments, deleteDeployments, getDeploymentsByProject , updateDeploymentStatus} = require(path.join(__dirname, '..', 'controller', 'deploymentController'));

const router = express.Router();

router.post('/', createDeployment);
router.get('/', getAllDeployments);
router.delete('/:projectName', deleteDeployments);
router.get('/:projectName', getDeploymentsByProject);
router.post('/', updateDeploymentStatus);
// TODO: edit endpoints

module.exports = router;