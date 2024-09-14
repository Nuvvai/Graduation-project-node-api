const path = require("node:path");
const express = require("express");
const { default: mongoose } = require("mongoose");
const authRouter = require(path.join(__dirname, 'routes', 'auth.js'));

const app = new express();

app.use(express.json());
app.use('/auth', authRouter);

const CONNECTION_URL = 'mongodb://localhost:27017/';
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB successfully"))
    .then(() => app.listen(PORT, () => console.log(`Server listening on port ${PORT}`)))
    .catch((error) => console.error(error.message));