const path = require('path');

const express = require('express')
const router = express.Router();

const { getUserProfile, deleteUser, updateUserProfile, getAllUsers } = require(path.join('..', 'controller', 'userController'));

router.get('/', getAllUsers);
router.get('/:name', getUserProfile);
router.delete('/:name', deleteUser);
router.put('/:name', updateUserProfile);

module.exports = router;
