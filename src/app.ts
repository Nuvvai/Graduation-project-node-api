import {join} from 'path';
import express,{Express, Router} from 'express';
import mongoose from 'mongoose';

const authRouter:Router = require(join(__dirname, 'routes', 'auth'));
const projectsRoutes:Router = require(join(__dirname, 'routes', 'projectRoutes'));
const deploymentRoutes:Router = require(join(__dirname, 'routes', 'deploymentRoutes'));
const pipelineRoutes:Router = require(join(__dirname, 'routes', 'pipelineRoutes'));
import userRoutes from './routes/userRoutes';
import errorHandler from './middleware/errorHandler';

type PORT = string | number;

const app:Express = express();

app.use(express.json());
app.use('/auth', authRouter);
app.use('/projects', projectsRoutes);
app.use('/deployments', deploymentRoutes);
app.use('/pipelines', pipelineRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);


const CONNECTION_URL:string = process.env.MONGO_URL || 'mongodb://localhost:27017/';
const PORT:PORT = process.env.PORT || 5000;

mongoose.connect(CONNECTION_URL)
    .then(() => console.log("Connected to MongoDB successfully!"))
    .then(() => app.listen(PORT, () => console.log(`Server listening on port ${PORT}`)))
    .catch((error: { message: any; }) => console.error(error.message));