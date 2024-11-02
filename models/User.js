const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { type: 'string', required: true, unique: true },
    email: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    role: { type: 'string', required: true, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: 'date', default: Date.now },
});

userSchema.statics.checkExistence = async function(name, res) {
    const userExists = await this.findOne({ name: name }).select('-password');
    if (!userExists) {
        return res.status(404).json({
            message: 'User not found!'
        });
    }
    return userExists;
};

module.exports = mongoose.model('User', userSchema);