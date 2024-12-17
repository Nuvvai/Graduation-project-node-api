import express from 'express';
const router = express.Router();

import { register_controller, login_controller } from '../controller/authController'

router.post('/register', register_controller)
router.post('/login', login_controller)

export default router;