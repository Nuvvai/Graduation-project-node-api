const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require(path.join(__dirname, '..', 'models', 'User'));

const register_controller = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) return res.status(404).json({ message: 'User already exists' }); //wrong status ...!!!

        if (!name || !email || !password) return res.status(406).json({ message: "Not accepted, missing parameter" });
        else if (email.length < 6 || email.indexOf('@') === -1) return res.status(406).json({ message: 'Invalid email format' }); //not tested yet ...!!
        else if (password.length < 6) return res.status(406).json({ message: 'Password must be at least 6 characters long' });  //not tested yet ...!!
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password)) return res.status(406).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });  //not tested yet ...!!

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ email: newUser.email, id: newUser._id }, 'secret', { expiresIn: '1d' });
        res.status(201).json({ result: newUser, token }); // send as http only cookie

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

const login_controller = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });
        if (!existingUser) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) return res.status(404).json({ message: 'Invalid credentials' }); //wrong status ...!!!

        const token = jwt.sign({ email: existingUser.email, id: existingUser.id }, 'secret', { expiresIn: '1d' });
        res.status(200).json({ result: existingUser }); // send as http only cookie

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

module.exports = { register_controller, login_controller };