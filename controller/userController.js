const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));
const bcrypt = require('bcryptjs');

/**
 * Retrieves the profile of a user by their name.
 * 
 * @param {Object} req - The request object.
 * @param {Object} req.params - The parameters of the request.
 * @param {string} req.params.name - The name of the user to retrieve.
 * @param {Object} res - The response object.
 * 
 * @returns {Promise<void>} - A promise that resolves to void.
 * 
 * @throws {Error} - If there is an error fetching the user profile.
 */
const getUserProfile = async (req, res) => {
    try {
        const { name } = req.params;
        const userExists = await User.findOne({ name: name });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        res.status(200).json(userExists)
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user profile!",
            error: error.message
        })
    }
}

/**
 * Deletes a user by name.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.name - The name of the user to delete.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the user is deleted.
 */
const deleteUser = async (req, res) => {
    try {
        const { name } = req.params;
        const userExists = await User.findOne({ name: name });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        await User.findOneAndDelete(userExists) // might edit this
        res.status(200).json({ message: "User deleted successfully!" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user!",
            error: error.message
        })
    }
}

/**
 * Updates the user profile with the provided information.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.name - The name of the user to update.
 * @param {Object} req.body - The request body.
 * @param {string} [req.body.newName] - The new name for the user.
 * @param {string} [req.body.newEmail] - The new email for the user.
 * @param {string} [req.body.newPassword] - The new password for the user.
 * @param {string} [req.body.newPasswordAgain] - The new password again for confirmation.
 * @param {string} [req.body.oldPassword] - The old password for verification.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the profile is updated.
 */
const updateUserProfile = async (req, res) => {
    try {
        const { name } = req.params;
        const userExists = await User.findOne({ name: name });
        if (!userExists) {
            return res.status(404).json({
                message: 'User not found!'
            })
        }
        const user = userExists;
        const { newName, newEmail, newPassword, newPasswordAgain, oldPassword } = req.body;
        if (newName) {
            user.name = newName;
        }
        if (newEmail) {
            user.email = newEmail;
        }
        if (newPassword && newPasswordAgain && oldPassword && (newPassword === newPasswordAgain)) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect old password!' });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            user.password = hashedPassword;
        } else if (newPassword && !oldPassword) {
            return res.status(400).json({ message: "Please enter old password!" })
        } else if (newPassword != newPasswordAgain) {
            return res.status(400).json({ message: "Passwords don't match!" })
        }
        await user.save();
        res.status(200).json({ message: "Profile updated successfully!", user })

    } catch (error) {
        res.status(500).json({
            message: "Error updating profile!",
            error: error.message
        })
    }
}

// admin only
/**
 * Retrieves all users from the database, excluding their passwords.
 * 
 * @async
 * @function getAllUsers
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with the list of users or an error message.
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');//exclude password
        res.json(users)
    } catch (error) {
        res.status(500).json({
            message: "Error fetching user!",
            error: error.message
        })
    }
}


module.exports = { getUserProfile, deleteUser, updateUserProfile, getAllUsers };