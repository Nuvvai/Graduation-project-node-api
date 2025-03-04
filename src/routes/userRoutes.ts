import express, { Router } from 'express';
import { getUserProfile, deleteUser, updateUserProfile, getAllUsers } from '../controller/userController';
const router: Router = express.Router();

router.get('/', getAllUsers);

router.get('/:username', getUserProfile);

router.delete('/:username', deleteUser);

router.put('/:username', updateUserProfile);

export default router;