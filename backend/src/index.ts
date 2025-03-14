import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Import routes
import authRoutes from './routes/authRoutes';
import applicationRoutes from './routes/applicationRoutes';
import formRoutes from './routes/formRoutes';
import projectRoutes from './routes/projectRoutes';
import userRoutes from './routes/userRoutes';
import organizationRoutes from './routes/organizationRoutes';
import uploadRoutes from './routes/uploadRoutes';
// app.use('/api/users', userRoutes);
// app.use('/api/projects', projectRoutes);
// app.use('/api/forms', formRoutes);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Custom error type
interface ApiError extends Error {
  statusCode?: number;
}

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/upload', uploadRoutes);
// app.use('/api/projects', projectRoutes);

// Simple health check route
app.get('/api/health', (_req: Request, res: Response): void => {
  res.status(200).json({ 
    status: 'ok',
    message: 'CrypticBroker API is running',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: ApiError, req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.info(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
const handleShutdown = async (): Promise<void> => {
  await prisma.$disconnect();
  console.info('Prisma client disconnected');
  process.exit(0);
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown); 