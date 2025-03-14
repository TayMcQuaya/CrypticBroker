import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AppError, catchAsync } from '../utils/errors';

/**
 * @desc    Create a new organization
 * @route   POST /api/organizations
 * @access  Private
 */
export const createOrganization = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { name, type, description, website } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    next(new AppError('Not authenticated', 401));
    return;
  }

  const organization = await prisma.organization.create({
    data: {
      name,
      type,
      description,
      website,
      ownerId: userId
    }
  });

  res.status(201).json({
    status: 'success',
    data: { organization }
  });
});

/**
 * @desc    Get all organizations
 * @route   GET /api/organizations
 * @access  Private
 */
export const getOrganizations = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const organizations = await prisma.organization.findMany();
  
  res.status(200).json({
    status: 'success',
    data: { organizations }
  });
});

/**
 * @desc    Get organization by ID
 * @route   GET /api/organizations/:id
 * @access  Private
 */
export const getOrganization = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;

  const organization = await prisma.organization.findUnique({
    where: { id }
  });

  if (!organization) {
    next(new AppError('Organization not found', 404));
    return;
  }

  res.status(200).json({
    status: 'success',
    data: { organization }
  });
});

/**
 * @desc    Update organization
 * @route   PATCH /api/organizations/:id
 * @access  Private
 */
export const updateOrganization = catchAsync(async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { name, description, website } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    next(new AppError('Not authenticated', 401));
    return;
  }

  const organization = await prisma.organization.update({
    where: { id },
    data: {
      name: name || undefined,
      description: description || undefined,
      website: website || undefined
    }
  });

  res.status(200).json({
    status: 'success',
    data: { organization }
  });
});

/**
 * @desc    Add member to organization
 * @route   POST /api/organizations/:id/members
 * @access  Private
 */
export const addMember = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { id } = req.params;
  const { userId, role } = req.body;

  const member = await prisma.organizationMember.create({
    data: {
      organizationId: id,
      userId,
      role
    }
  });

  res.status(201).json({
    status: 'success',
    data: { member }
  });
});

/**
 * @desc    Remove member from organization
 * @route   DELETE /api/organizations/:id/members/:memberId
 * @access  Private
 */
export const removeMember = catchAsync(async (
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> => {
  const { memberId } = req.params;

  await prisma.organizationMember.delete({
    where: {
      id: memberId
    }
  });

  res.status(204).send();
}); 