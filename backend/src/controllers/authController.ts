import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../index';
import { catchAsync, AppError, badRequest } from '../utils/errors';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

// Define user roles
type UserRole = 'ADMIN' | 'PROJECT_OWNER' | 'INVESTOR' | 'ACCELERATOR';

// Request types
type AuthRequest<T> = Request<Record<string, string>, unknown, T>;

// User interface
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

// Extend Express Request
declare module 'express' {
  export interface Request {
    user?: User;
  }
}

// Response interfaces
interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: Omit<User, 'passwordHash'>;
  };
}

interface UserResponse {
  status: string;
  data: {
    user: Omit<User, 'passwordHash'>;
  };
}

/**
 * Generates a JWT token for a user
 */
const signToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN ? parseInt(process.env.JWT_EXPIRES_IN) : '90d'
  };
  return jwt.sign({ id }, jwtSecret, options);
};

/**
 * Creates and sends a JWT token
 */
const createSendToken = (
  user: User,
  statusCode: number,
  res: Response<AuthResponse>
): void => {
  const token = signToken(user.id);
  const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: userWithoutPassword,
    },
  });
};

interface SignupRequestBody {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

/**
 * Register a new user
 * @route POST /api/auth/signup
 */
export const signup = catchAsync(async (
  req: AuthRequest<SignupRequestBody>,
  res: Response<AuthResponse>,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return next(badRequest('Please provide all required fields'));
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(badRequest('Email already in use'));
    }

    const passwordHash = await bcrypt.hash(password, 12);

    type CreateUserData = {
      email: string;
      passwordHash: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isEmailVerified: boolean;
    };

    const userData: CreateUserData = {
      email,
      passwordHash,
      firstName,
      lastName,
      role: (role as UserRole) || 'PROJECT_OWNER',
      isEmailVerified: false,
    };

    const newUser = await prisma.users.create({
      data: userData as unknown as Prisma.usersCreateInput,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof Error) {
      return next(new AppError(`Registration failed: ${error.message}`, 500));
    }
    return next(new AppError('Registration failed', 500));
  }
});

interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = catchAsync(async (
  req: AuthRequest<LoginRequestBody>,
  res: Response<AuthResponse>,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(badRequest('Please provide email and password'));
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return next(badRequest('Invalid email or password'));
    }

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      return next(new AppError(`Login failed: ${error.message}`, 500));
    }
    return next(new AppError('Login failed', 500));
  }
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
export const getMe = catchAsync(async (
  req: Request,
  res: Response<UserResponse>,
  next: NextFunction
) => {
  try {
    if (!req.user?.id) {
      return next(new AppError('User not found or not logged in', 404));
    }

    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      status: 'success',
      data: {
        user: userWithoutPassword,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    if (error instanceof Error) {
      return next(new AppError(`Failed to get profile: ${error.message}`, 500));
    }
    return next(new AppError('Failed to get profile', 500));
  }
});

interface UpdateMeRequestBody {
  firstName?: string;
  lastName?: string;
  email?: string;
}

/**
 * Update user profile
 * @route PATCH /api/auth/updateMe
 */
export const updateMe = catchAsync(async (
  req: AuthRequest<UpdateMeRequestBody>,
  res: Response<UserResponse>,
  next: NextFunction
) => {
  const { firstName, lastName, email } = req.body;

  if (!req.user?.id) {
    return next(new AppError('User not found or not logged in', 404));
  }

  if (!firstName && !lastName && !email) {
    return next(badRequest('Please provide at least one field to update'));
  }

  const updateData: Record<string, string> = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (email) updateData.email = email;

  const updatedUser = await prisma.users.update({
    where: { id: req.user.id },
    data: updateData,
  });

  const { passwordHash: _passwordHash, ...userWithoutPassword } = updatedUser;

  res.status(200).json({
    status: 'success',
    data: {
      user: userWithoutPassword,
    },
  });
});