const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require(path.join(__dirname, '..', 'models', 'User'));

const register_controller = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) return res.status(409).json({ message: 'User already exists' });

        if (!name || !email || !password) return res.status(406).json({ message: "Not accepted, missing parameter" });
        else if (name.indexOf('@') !== -1) return res.status(406).json({ message: 'Invalid name can not include \"@\"' }); //not tested yet ...!!
        else if (email.length < 6 || email.indexOf('@') === -1) return res.status(406).json({ message: 'Invalid email format' }); //not tested yet ...!!
        else if (password.length < 6) return res.status(406).json({ message: 'Password must be at least 6 characters long' });  //not tested yet ...!!
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(password)) return res.status(406).json({ message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' });  //not tested yet ...!!

        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        const token = jwt.sign({ name: newUser.name, email: newUser.email, id: newUser._id }, 'secret', { expiresIn: '1d' });
        res.cookie('jwt-token', token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(201).json({ result: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
}

const login_controller = async (req, res) => {
    const { nameOrEmail, password } = req.body;

    try {
        if (!nameOrEmail || !password) return res.status(406).json({ message: "Not accepted, missing parameter" });

        let existingUser;
        if (nameOrEmail.indexOf('@') === -1) {
            const UserName = nameOrEmail;
            existingUser = await User.findOne({ name: UserName });
        } else if (nameOrEmail.indexOf('@') !== -1) {
            const UserEmail = nameOrEmail;
            existingUser = await User.findOne({ email: UserEmail });
        }

        if (!existingUser) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ name: existingUser.name, email: existingUser.email, id: existingUser.id }, 'secret', { expiresIn: '1d' });
        res.cookie('jwt-token', token, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.status(200).json({ result: existingUser })

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Something went wrong',
            error: error.message
        });
    }
}

module.exports = { register_controller, login_controller };