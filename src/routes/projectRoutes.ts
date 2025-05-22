import express, { Router } from 'express';
import { createProject, updateProject, getAllProjects, deleteProject, deleteAllProjects } from '../controller/projectController';

const router: Router = express.Router();

/**
 * Route for creating a project for a user.
 * @route POST /projects/:username
 */
router.post('/:username', createProject);

/**
 * Route for updating a specific project by username and project name.
 * @route PUT /projects/:username/:projectName
 */
router.put('/:username/:projectName', updateProject);

/**
 * Route for retrieving all projects for a specific user.
 * @route GET /projects/:username
 */
router.get('/:username', getAllProjects);

/**
 * Route for deleting a specific project by username and project name.
 * @route DELETE /projects/:username/:projectName
 */
router.delete('/:username/:projectName', deleteProject);

/**
 * Route for deleting all projects for a specific user.
 * @route DELETE /projects/:username
 */
router.delete('/:username', deleteAllProjects);

export default router;