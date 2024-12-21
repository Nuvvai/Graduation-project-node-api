import express from 'express';
const router = express.Router();

import { register_controller, login_controller } from '../controller/authController'

// @access public
router.post('/register', register_controller);

// @access public
router.post('/login', login_controller);

export default router;