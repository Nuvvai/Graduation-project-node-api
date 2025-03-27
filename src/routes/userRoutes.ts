import express, { Router } from 'express';
import { getUserProfile, deleteUser, updateUserProfile, updateAzureDevOpsUserProfile, updateBitbucketUserProfile, updateGitlabUserProfile, updateGithubUserProfile } from '../controller/userController';

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

/**
 * Route for updating a user github profile by name.
 * @route PUT /users/me
 */
router.put('/me/github', updateGithubUserProfile);

/**
 * Route for updating a user gitlab profile by name.
 * @route PUT /users/me
 */
router.put('/me/gitlab', updateGitlabUserProfile);

/**
 * Route for updating a user bitbucket profile by name.
 * @route PUT /users/me
 */
router.put('/me/bitbucket', updateBitbucketUserProfile);

/**
 * Route for updating a user azure-devops profile by name.
 * @route PUT /users/me
 */
router.put('/me/azure-devops', updateAzureDevOpsUserProfile);

export default router;