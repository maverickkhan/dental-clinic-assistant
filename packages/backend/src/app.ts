import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { globalLimiter } from './middleware/rateLimiter.middleware';
import { API_BASE } from '@dental-clinic/shared';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import patientsRoutes from './modules/patients/patients.routes';
import chatRoutes from './modules/chat/chat.routes';

const app = express();

// Trust proxy - required for rate limiting behind Render's reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use(globalLimiter);

// Health check endpoint
app.get(`${API_BASE}/health`, (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/patients`, patientsRoutes);
app.use(`${API_BASE}/chat`, chatRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
