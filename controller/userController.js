const User  = require('../models/User')
const bcrypt = require('bcryptjs');

const userController = {
    async getUserProfile(req, res){
        try{
            const {name} = req.params;
            const user = await User.checkExistence(name, res)
            if(user){
                return res.status(200).json(user);
            }
        }catch(error){
            res.status(500).json({
                message: "Error fetching user profile!",
                error: error.message
            })
        }
    },

    async deleteUser(req, res){
        try{
            const {name} = req.params;
            const user = await User.checkExistence(name, res);
            await User.findOneAndDelete(user) // might edit this
            res.status(200).json({message: "User deleted successfully!"});
        }catch(error){
            res.status(500).json({
                message: "Error deleting user!",
                error: error.message
            })
        }
    },

    async updateUserProfile(req, res){
        try{
            const {name} = req.params;
            const user = await User.checkExistence(name, res)
            const{newName, newEmail, newPassword, newPasswordAgain, oldPassword} = req.body;
            if(newName){
                user.name = newName;
            }
            if(newEmail){
                user.email = newEmail;
            }
            if(newPassword && newPasswordAgain && oldPassword && (newPassword === newPasswordAgain)){
                const isMatch = await bcrypt.compare(oldPassword, user.password);
                if (!isMatch) {
                return res.status(400).json({ message: 'Incorrect old password!' });
                }
                const hashedPassword = await bcrypt.hash(newPassword, 12);
                user.password = hashedPassword;
            }else if(newPassword && !oldPassword){
                return res.status(400).json({message: "Please enter old password!"})
            }else if(newPassword != newPasswordAgain){
                return res.status(400).json({message: "Passwords don't match!"})
            }
            await user.save();
            res.status(200).json({message: "Profile updated successfully!", user})

        }catch(error){
            res.status(500).json({
                message: "Error updating profile!",
                error: error.message
            })
        }
    },

    // admin only
    async getAllUsers(req, res){
        try{
            const users = await User.find().select('-password');//exclude password
            res.json(users)
        }catch(error){
            res.status(500).json({
                message: "Error fetching user!",
                error: error.message
            })
        }
    }
}

module.exports = userController;