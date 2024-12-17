const path = require('path');

import express, { Router } from 'express';
const router:Router = express.Router();

const { getUserProfile, deleteUser, updateUserProfile, getAllUsers } = require(path.join('..', 'controller', 'userController'));

router.get('/', getAllUsers);
router.get('/:username', getUserProfile);
router.delete('/:username', deleteUser);
router.put('/:username', updateUserProfile);

export default router;