import express, { Router } from 'express';
import { getUserProfile, deleteUser, updateUserProfile } from '../controller/userController';

const router: Router = express.Router();

/**
 * Route for retrieving a user profile by name.
 * @route GET /users/me
 */
router.get('/me', getUserProfile);

/**
 * Route for deleting a user by name.
 * @route DELETE /users/me
 */
router.delete('/me', deleteUser);

/**
 * Route for updating a user profile by name.
 * @route PUT /users/me
 */
router.put('/me', updateUserProfile);

export default router;