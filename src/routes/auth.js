const path = require('path');
const express = require('express');
const router = express.Router();

const { register_controller, login_controller } = require(path.join(__dirname, '..', 'controller', 'authController.js'));

router.post('/register', register_controller)
router.post('/login', login_controller)

module.exports = router;