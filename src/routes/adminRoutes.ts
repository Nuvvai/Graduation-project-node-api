import express from 'express';
import { getAllUsers, updateUserRole, getSystemStats, searchUsers } from '../controller/adminController';

const router = express.Router();

/**
 * Route for retrieving all users excluding passwords.
 * @route GET /admin/users
 */
router.get('/users', getAllUsers);

/**
 * Route for updating a user role to admin.
 * @route PUT /admin/users/:username
 */
router.put('/users/:username', updateUserRole);

/**
 * Route for retrieving system statistics.
 * @route GET /admin/stats
 */
router.get('/stats', getSystemStats);

/**
 * Route for searching users.
 * @route GET /admin/users/search
 */
router.get('/users/search', searchUsers)

export default router;