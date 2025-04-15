import express, { Router } from 'express';
import { register_controller, login_controller, refreshToken_controller, logout_controller, githubAuth_controller, githubCallback_controller, status_controller } from '../controller/authController'
import { sendOtp } from "../controller/otpUserController";

const router: Router = express.Router();

// @access public
router.post('/register', register_controller);

// @access public
router.post('/login', login_controller);

// @access private
router.get('/refresh-token', refreshToken_controller);

// @access private
router.delete('/logout', logout_controller)

// @access public
router.get('/github', githubAuth_controller);

// @access public
router.get('/github/callback', githubCallback_controller);

// @access public
router.get('/status', status_controller);

// @access public
router.post('/sendOtp', sendOtp);

export default router;