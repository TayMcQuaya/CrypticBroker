import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError, catchAsync } from '../utils/errors';
import bcrypt from 'bcrypt';

/**
 * @desc    Get current user's profile
 * @route   GET /api/users/me
 * @access  Private
 */
export const getMe = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    next(new AppError('Not authenticated', 401));
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      projects: {
        select: {
          id: true,
          name: true,
          status: true
        }
      },
      organizations: {
        select: {
          organization: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          role: true
        }
      }
    }
  });

  if (!user) {
    next(new AppError('User not found', 404));
    return;
  }

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

/**
 * @desc    Update current user's profile
 * @route   PATCH /api/users/me
 * @access  Private
 */
export const updateMe = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;
  const { firstName, lastName, currentPassword, newPassword } = req.body;

  if (!userId) {
    next(new AppError('Not authenticated', 401));
    return;
  }

  // If updating password, verify current password
  if (newPassword) {
    if (!currentPassword) {
      next(new AppError('Please provide current password', 400));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      next(new AppError('User not found', 404));
      return;
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      next(new AppError('Current password is incorrect', 401));
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update user with new password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        firstName: firstName || undefined,
        lastName: lastName || undefined
      }
    });
  } else {
    // Update user without password change
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined
      }
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully'
  });
});

/**
 * @desc    Delete current user's account
 * @route   DELETE /api/users/me
 * @access  Private
 */
export const deleteMe = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    next(new AppError('Not authenticated', 401));
    return;
  }

  // Delete user
  await prisma.user.delete({
    where: { id: userId }
  });

  res.status(204).send();
});

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          projects: true,
          organizations: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
}); 