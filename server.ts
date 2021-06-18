require('express-async-errors');
import express from 'express';
import cors from 'cors';
import errorHandler from './src/middleware/ErrorHandler';
import UserRoutes from './src/routes/User';
import RelationRoutes from './src/routes/Relation';

export const createServer = () => {
  const app = express();
  app.use(express.json({ limit: '8mb' }));
  app.use(cors());
  app.use('/api/users/relation', RelationRoutes);
  app.use('/api/users', UserRoutes);
  app.use(errorHandler);
  return app;
};
