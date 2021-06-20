require('express-async-errors');
import express from 'express';
import cors from 'cors';
import errorHandler from './src/middleware/ErrorHandler';
import MetricsRoutes from './src/routes/Metrics';
import UserRoutes from './src/routes/User';
import RelationRoutes from './src/routes/Relation';
import metricsMiddleware from './src/middleware/MetricsMiddleware';

export const createServer = () => {
  const app = express();
  app.use(express.json({ limit: '8mb' }));
  app.use(cors());
  app.use(metricsMiddleware);
  app.use('/metrics', MetricsRoutes);
  app.use('/api/users/relation', RelationRoutes);
  app.use('/api/users', UserRoutes);
  app.use(errorHandler);
  return app;
};
