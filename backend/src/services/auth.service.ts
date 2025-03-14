import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserCreate, IUserResponse } from '../models/User';
import { AppError } from '../utils/errors';

const prisma = new PrismaClient();

export class AuthService {
  private static generateToken(userId: string): string {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET environment variable is not set', 500);
    }
    return jwt.sign({ userId }, jwtSecret, {
      expiresIn: '24h',
    });
  }

  static async register(userData: IUserCreate): Promise<{ user: IUserResponse; token: string }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        avatar: userData.avatar || null,
        role: userData.role || 'PROJECT_OWNER',
        isEmailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = this.generateToken(user.id);

    return { user, token };
  }

  static async login(email: string, password: string): Promise<{ user: IUserResponse; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const { passwordHash: _, ...userResponse } = user;
    const token = this.generateToken(user.id);

    return { user: userResponse, token };
  }

  static async verifyToken(token: string): Promise<string> {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new AppError('JWT_SECRET environment variable is not set', 500);
      }
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      return decoded.userId;
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
} 