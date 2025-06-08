import express,{Express} from 'express';
import adminRoutes from './routes/adminRoutes';
import authRouter from './routes/auth';
import projectsRoutes from './routes/projectRoutes';
import deploymentRoutes from './routes/deploymentRoutes';
import pipelineRoutes from './routes/pipelineRoutes';
import providerRoutes from './routes/providers';
import userRoutes from './routes/userRoutes';
import deployRoutes from './routes/deploy';
import errorHandler from './middleware/errorHandler';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { verifyToken } from './middleware/verifyToken';
import { verifyAdmin } from './middleware/verifyAdmin';
import { collectDefaultMetrics, Registry, Counter } from 'prom-client';


const FRONTEND_DOMAIN_NAME: string = process.env.FRONTEND_DOMAIN_NAME || "http://localhost:5173";

const app: Express = express();

const register = new Registry();
collectDefaultMetrics({ register });

const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'statusCode']
});

register.registerMetric(httpRequestCounter);

app.use((req, res, next) => {
    res.on('finish', () => {
        httpRequestCounter.inc({
        method: req.method,
        route: req.route?.path || req.path || req.url,
        statusCode: res.statusCode.toString(),
        });
    });
    next();
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: FRONTEND_DOMAIN_NAME, credentials: true }));


app.use('/auth', authRouter);
app.use(verifyToken);
app.use('/providers', providerRoutes);
app.use('/projects', projectsRoutes);
app.use('/deployments', deploymentRoutes);
app.use('/pipelines', pipelineRoutes);
app.use('/users', userRoutes);
app.use('/deploy',deployRoutes);
app.use('/admin', verifyAdmin, adminRoutes);

app.use(errorHandler);

export default app;