import path from 'path';
import express from 'express';
const router = express.Router();

const { register_controller, login_controller } = require(path.join(__dirname, '..', 'controller', 'authController.js'));

router.post('/register', register_controller)
router.post('/login', login_controller)

export default router;