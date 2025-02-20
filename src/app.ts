import express,{Express} from 'express';
import mongoose from 'mongoose';

import authRouter from './routes/auth';
import projectsRoutes from './routes/projectRoutes';
import deploymentRoutes from './routes/deploymentRoutes';
import pipelineRoutes from './routes/pipelineRoutes';
import userRoutes from './routes/userRoutes';
import errorHandler from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';

//Section for development phase only
import dotenv from 'dotenv';

dotenv.config();
//

type PORT = string | number;

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: "http://localhost:80", credentials: true }));

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

export default app;