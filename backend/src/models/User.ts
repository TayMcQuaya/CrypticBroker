import { UserRole } from '@prisma/client';

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: UserRole;
}

export interface IUserUpdate {
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: UserRole;
}

export interface IUserResponse {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
} 