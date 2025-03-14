import { PrismaClient } from '@prisma/client';
import { IUserUpdate, IUserResponse } from '../models/User';

const prisma = new PrismaClient();

export class UserService {
  static async getUser(userId: string): Promise<IUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async updateUser(userId: string, userData: IUserUpdate): Promise<IUserResponse> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: userData,
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

    return user;
  }

  static async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }

  static async getUsersByOrganization(organizationId: string): Promise<IUserResponse[]> {
    const users = await prisma.user.findMany({
      where: {
        organizations: {
          some: {
            organizationId
          }
        }
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

    return users;
  }
} 