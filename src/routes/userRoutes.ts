import express, { Router } from 'express';
import { getUserProfile, deleteUser, updateUserProfile, getAllUsers } from '../controller/userController';

const router: Router = express.Router();

/**
 * Route for retrieving all users.
 * @route GET /users
 */
router.get('/', getAllUsers);

/**
 * Route for retrieving a user profile by name.
 * @route GET /users/:name
 */
router.get('/:username', getUserProfile);

/**
 * Route for deleting a user by name.
 * @route DELETE /users/:name
 */
router.delete('/:username', deleteUser);

/**
 * Route for updating a user profile by name.
 * @route PUT /users/:name
 */
router.put('/:username', updateUserProfile);

export default router;