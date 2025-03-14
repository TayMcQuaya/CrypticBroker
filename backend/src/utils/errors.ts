import { Request, Response, NextFunction } from 'express';

/**
 * Custom API error class that includes a status code
 */
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Handle async errors in Express routes
 */
export const catchAsync = (fn: AsyncRequestHandler): AsyncRequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Creates a 404 error for resource not found
 */
export const notFound = (message: string): AppError => {
  return new AppError(message, 404);
};

/**
 * Creates a 401 error for unauthorized access
 */
export const unauthorized = (message = 'Unauthorized'): AppError => {
  return new AppError(message, 401);
};

/**
 * Creates a 403 error for forbidden access
 */
export const forbidden = (message = 'Forbidden'): AppError => {
  return new AppError(message, 403);
};

/**
 * Creates a 400 error for bad request
 */
export const badRequest = (message: string): AppError => {
  return new AppError(message, 400);
};