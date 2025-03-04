import express, { Router } from 'express';
import { createProject, getAllProjects, deleteProject, deleteAllProjects } from '../controller/projectController';

const router: Router = express.Router();

router.post('/:username', createProject);

router.get('/:username', getAllProjects);

router.delete('/:username/:projectName', deleteProject);

router.delete('/:username', deleteAllProjects);

export default router;
