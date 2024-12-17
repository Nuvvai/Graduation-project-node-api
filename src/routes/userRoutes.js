const path = require('path');

const express = require('express')
const router = express.Router();

const { getUserProfile, deleteUser, updateUserProfile, getAllUsers } = require(path.join('..', 'controller', 'userController'));

router.get('/', getAllUsers);
router.get('/:username', getUserProfile);
router.delete('/:username', deleteUser);
router.put('/:username', updateUserProfile);

module.exports = router;
