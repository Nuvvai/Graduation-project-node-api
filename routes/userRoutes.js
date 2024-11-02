const path = require('path');

const express = require('express')
const router = express.Router();

const { getUserProfile, deleteUser, updateUserProfile, getAllUsers } = require(path.join('..', 'controller', 'userController'));

router.get('/:name', getUserProfile);
router.get('/', getAllUsers);
router.delete('/:name', deleteUser);
router.put('/:name', updateUserProfile);

module.exports = router;
