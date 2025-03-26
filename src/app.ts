import express,{Express} from 'express';
import adminRoutes from './routes/adminRoutes';
import authRouter from './routes/auth';
import projectsRoutes from './routes/projectRoutes';
import deploymentRoutes from './routes/deploymentRoutes';
import pipelineRoutes from './routes/pipelineRoutes';
import usersRoutes from './routes/usersRoutes';
import errorHandler from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { verifyToken } from './middleware/verifyToken';
import userRoutes from './routes/userRoutes';
// import { verifyAdmin } from './middleware/verifyAdmin';


const FRONTEND_DOMAIN_NAME: string = process.env.FRONTEND_DOMAIN_NAME || "http://localhost:5173";

const app: Express = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: FRONTEND_DOMAIN_NAME, credentials: true }));


app.use('/auth', authRouter);
app.use(verifyToken);
app.use('/projects', projectsRoutes);
app.use('/deployments', deploymentRoutes);
app.use('/pipelines', pipelineRoutes);
app.use('/user', userRoutes);
app.use('/users', usersRoutes);
// app.use(verifyAdmin);
app.use('/admin', adminRoutes);

app.use(errorHandler);

export default app;