const userController = require('../controller/userController');
const express = require('express')
const router = express.Router();

router.get('/:name', userController.getUserProfile);
router.get('/', userController.getAllUsers);
router.delete('/:name', userController.deleteUser);
router.put('/:name', userController.updateUserProfile);

module.exports = router;
