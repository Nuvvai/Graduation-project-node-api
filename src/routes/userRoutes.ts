import express, { Router } from 'express';

import { getUserProfile, deleteUser, updateUserProfile, getAllUsers } from '../controller/userController';

const router:Router = express.Router();

//@access — private admin only
router.get('/', getAllUsers);

//@access — private for the authenticated user only
router.get('/:username', getUserProfile);

//@access — private for the authenticated user only
router.delete('/:username', deleteUser);

//@access — private for the authenticated user only
router.put('/:username', updateUserProfile);

export default router;