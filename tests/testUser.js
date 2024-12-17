const mongoose = require('mongoose');
const User = require('../src/models/User');


const CONNECTION_URL = 'mongodb://localhost:27017/users';

// connect to the MongoDB database
mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB successfully");
        runTests(); // run the tests
    })
    .catch((error) => console.error(error.message));

async function runTests() {
    try {
        // Create a new user
        console.log('Creating user...');
        const user = new User({
            name: 'testuser',
            email: 'testuser@example.com',
            password: 'testpassword',
            role: 'user'
        });

        // Save the user to the database
        await user.save();
        console.log('User created:', user);

        // find the user in the database
        console.log('Finding user...');
        const foundUser = await User.findOne({ name: 'testuser' });
        console.log('User found:', foundUser);

        //update user details
        console.log('Updating user...');
        foundUser.email = 'newemail@example.com';
        await foundUser.save();
        console.log('User updated:', foundUser);

        // delete the user
        console.log('Deleting user...');
        await User.deleteOne({ name: 'testuser' });
        console.log('User deleted');

    } catch (error) {
        console.error('Error during tests:', error);
    } finally {
        mongoose.connection.close();
    }
}
