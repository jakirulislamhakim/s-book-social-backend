import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import {
  appMiddleware,
  checkHealthRoute,
  globalErrorHandler,
  notFoundRoute,
} from './app/v1/middlewares';
import { V1ModulesRoutes } from './app/v1/routes';
import { swaggerV1Doc } from './app/v1/utils/swagger';

declare const __dirname: string;

const app: Application = express();

// loaded all app middleware from centralized file
appMiddleware(app);

// static file
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '7d', // Cache files for 7 days
  }),
);

// swagger ui docs
app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(swaggerV1Doc));

// all application routes for v1
app.use('/api/v1', V1ModulesRoutes);

// check health route
app.get('/', checkHealthRoute);

// global error handler
app.use(globalErrorHandler);
// global not found route
app.all('*', notFoundRoute);

export default app;
