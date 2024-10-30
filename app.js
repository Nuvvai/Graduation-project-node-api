const path = require("node:path");
const express = require("express");
const { default: mongoose } = require("mongoose");
const authRouter = require(path.join(__dirname, 'routes', 'auth.js'));
const projectsRoutes = require('./routes/projectRoutes');
const deploymentRoutes = require('./routes/deploymentRoutes');
const pipelineRoutes = require('./routes/pipelineRoutes');

const app = new express();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/api', projectsRoutes);
app.use('/api', deploymentRoutes);
app.use('/api', pipelineRoutes);

const CONNECTION_URL = 'mongodb://localhost:27017/';
const PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL)
    .then(() => console.log("Connected to MongoDB successfully!"))
    .then(() => app.listen(PORT, () => console.log(`Server listening on port ${PORT}`)))
    .catch((error) => console.error(error.message));