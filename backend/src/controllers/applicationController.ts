import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

// Define the ApplicationStatus type based on the Prisma schema
type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'REVIEWING' | 'INTERVIEWING' | 'ACCEPTED' | 'REJECTED';

/**
 * @desc    Create a new application
 * @route   POST /api/applications
 * @access  Private
 */
export const createApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { projectId, formSubmissionId, targetOrgId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    // Validate required fields
    if (!projectId || !targetOrgId) {
      res.status(400).json({
        status: 'error',
        message: 'Project ID and target organization ID are required'
      });
      return;
    }
    
    // Check if project exists and user is the owner
    const project = await prisma.project.findUnique({
      where: {
        id: projectId
      }
    });
    
    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }
    
    if (project.ownerId !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to create an application for this project'
      });
      return;
    }
    
    // Check if target organization exists
    const targetOrg = await prisma.organization.findUnique({
      where: {
        id: targetOrgId
      }
    });
    
    if (!targetOrg) {
      res.status(404).json({
        status: 'error',
        message: 'Target organization not found'
      });
      return;
    }
    
    // Check if form submission exists if provided
    if (formSubmissionId) {
      const formSubmission = await prisma.formSubmission.findUnique({
        where: {
          id: formSubmissionId
        }
      });
      
      if (!formSubmission) {
        res.status(404).json({
          status: 'error',
          message: 'Form submission not found'
        });
        return;
      }
      
      // Check if the form submission belongs to the user
      if (formSubmission.userId !== userId) {
        res.status(403).json({
          status: 'error',
          message: 'You do not have permission to use this form submission'
        });
        return;
      }
    }
    
    // Get user's organization if any
    const userOrg = await prisma.organizationMember.findFirst({
      where: {
        userId
      },
      include: {
        organization: true
      }
    });
    
    // Create application
    const application = await prisma.application.create({
      data: {
        projectId,
        formSubmissionId: formSubmissionId || undefined,
        applicantOrgId: userOrg?.organizationId || undefined,
        targetOrgId,
        status: 'DRAFT' as ApplicationStatus
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications for the authenticated user
 * @route   GET /api/applications
 * @access  Private
 */
export const getMyApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    // Get user's projects
    const userProjects = await prisma.project.findMany({
      where: {
        ownerId: userId
      },
      select: {
        id: true
      }
    });
    
    const projectIds = userProjects.map((project: { id: string }) => project.id);
    
    // Get applications for user's projects
    const applications = await prisma.application.findMany({
      where: {
        projectId: {
          in: projectIds
        }
      },
      include: {
        project: true,
        targetOrg: true,
        formSubmission: {
          select: {
            id: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applications for an organization
 * @route   GET /api/applications/organization/:id
 * @access  Private (Organization members only)
 */
export const getOrganizationApplications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    // Check if user is a member of the organization
    const isMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId
      }
    });
    
    if (!isMember && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view applications for this organization'
      });
      return;
    }
    
    // Get applications for the organization
    const applications = await prisma.application.findMany({
      where: {
        targetOrgId: id
      },
      include: {
        project: true,
        applicantOrg: true,
        formSubmission: {
          include: {
            form: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: applications.length,
      data: {
        applications
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get an application by ID
 * @route   GET /api/applications/:id
 * @access  Private
 */
export const getApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    const application = await prisma.application.findUnique({
      where: {
        id
      },
      include: {
        project: true,
        applicantOrg: true,
        targetOrg: true,
        formSubmission: {
          include: {
            form: true
          }
        }
      }
    });
    
    if (!application) {
      res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
      return;
    }
    
    // Check if user is authorized to view this application
    // User must be either the project owner or a member of the target organization
    const isProjectOwner = await prisma.project.findFirst({
      where: {
        id: application.projectId,
        ownerId: userId
      }
    });
    
    const isOrgMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: application.targetOrgId,
        userId
      }
    });
    
    if (!isProjectOwner && !isOrgMember && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this application'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        application
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an application status
 * @route   PATCH /api/applications/:id/status
 * @access  Private
 */
export const updateApplicationStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    // Check if application exists
    const application = await prisma.application.findUnique({
      where: {
        id
      },
      include: {
        project: true
      }
    });
    
    if (!application) {
      res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
      return;
    }
    
    // Check if user is authorized to update this application
    // For submitting: user must be the project owner
    // For reviewing: user must be a member of the target organization
    const isProjectOwner = application.project.ownerId === userId;
    
    const isOrgMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: application.targetOrgId,
        userId
      }
    });
    
    // Project owners can only submit applications
    if (isProjectOwner && status !== 'SUBMITTED') {
      res.status(403).json({
        status: 'error',
        message: 'Project owners can only submit applications'
      });
      return;
    }
    
    // Organization members can only update status for review stages
    if (isOrgMember && !['REVIEWING', 'INTERVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      res.status(403).json({
        status: 'error',
        message: 'Invalid status update for organization member'
      });
      return;
    }
    
    // If neither project owner nor org member, deny access
    if (!isProjectOwner && !isOrgMember && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this application'
      });
      return;
    }
    
    // Update application status
    const updatedApplication = await prisma.application.update({
      where: {
        id
      },
      data: {
        status: status as ApplicationStatus,
        notes: notes !== undefined ? notes : undefined
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        application: updatedApplication
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an application
 * @route   DELETE /api/applications/:id
 * @access  Private
 */
export const deleteApplication = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    // Check if application exists
    const application = await prisma.application.findUnique({
      where: {
        id
      },
      include: {
        project: true
      }
    });
    
    if (!application) {
      res.status(404).json({
        status: 'error',
        message: 'Application not found'
      });
      return;
    }
    
    // Check if user is the project owner
    if (application.project.ownerId !== userId && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this application'
      });
      return;
    }
    
    // Only allow deletion of draft applications
    if (application.status !== 'DRAFT') {
      res.status(400).json({
        status: 'error',
        message: 'Only draft applications can be deleted'
      });
      return;
    }
    
    // Delete application
    await prisma.application.delete({
      where: {
        id
      }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 