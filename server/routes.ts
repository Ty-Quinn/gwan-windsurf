
import express from 'express';
import authRoutes from './routes/auth';
import statsRoutes from './routes/stats';

export async function registerRoutes(app: express.Express) {
  // Register API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/stats', statsRoutes);

  return app;
}
