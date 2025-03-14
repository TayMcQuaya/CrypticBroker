import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, unauthorized } from '../utils/errors';
import { prisma } from '../lib/prisma';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type UserRole = 'ADMIN' | 'PROJECT_OWNER' | 'INVESTOR' | 'ACCELERATOR';

// Extend Express Request interface using module augmentation
declare module 'express' {
  export interface Request {
    user?: User;
  }
}

// JWT payload interface
interface JwtPayload extends jwt.JwtPayload {
  id: string;
}

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 * @throws {AppError} If token is missing, invalid, or user doesn't exist
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided. Please log in.', 401);
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    if (!decoded.id) {
      throw new AppError('Invalid token format', 401);
    }

    // Find user in database
    const currentUser = await prisma.users.findUnique({
      where: { id: decoded.id }
    });

    if (!currentUser) {
      throw new AppError('User no longer exists', 401);
    }

    // Attach user to request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(unauthorized('Invalid token. Please log in again.'));
    } else if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Authentication failed', 401));
    }
  }
};

/**
 * Authorization middleware to restrict routes based on user roles
 * Must be used after the protect middleware
 * 
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 * @throws {AppError} If user is not logged in or doesn't have required role
 */
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(unauthorized('You are not logged in. Please log in to get access.'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          'You do not have permission to perform this action',
          403
        )
      );
      return;
    }

    next();
  };
}; 