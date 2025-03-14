import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { Prisma, ProjectStatus } from '@prisma/client';

// Remove custom types and use Prisma's generated types
type ProjectCreateInput = Prisma.projectsCreateInput;
type ProjectUncheckedCreateInput = Prisma.projectsUncheckedCreateInput;

interface ProjectRequestBody {
  name: string;
  description?: string;
  website?: string;
  pitchDeckUrl?: string;
}

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (
  req: Request<{}, {}, ProjectRequestBody>,
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
    
    // Validate required fields
    if (!req.body.name) {
      res.status(400).json({
        status: 'error',
        message: 'Project name is required'
      });
      return;
    }
    
    // Create project using unchecked create input
    const project = await prisma.projects.create({
      data: {
        name: req.body.name,
        description: req.body.description ?? null,
        website: req.body.website ?? null,
        pitchDeckUrl: req.body.pitchDeckUrl ?? null,
        status: ProjectStatus.DRAFT,
        ownerId: userId
      } as Prisma.projectsUncheckedCreateInput
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects for the authenticated user
 * @route   GET /api/projects
 * @access  Private
 */
export const getMyProjects = async (
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
    
    const projects = await prisma.projects.findMany({
      where: {
        ownerId: userId
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: projects.length,
      data: {
        projects
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProject = async (
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
    
    const project = await prisma.projects.findUnique({
      where: {
        id
      },
      include: {
        applications: true,
        form_submissions: true
      }
    });
    
    if (!project) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }
    
    // Check if user is the owner of the project
    if (project.ownerId !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to access this project'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a project
 * @route   PATCH /api/projects/:id
 * @access  Private
 */
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, website, pitchDeckUrl, status } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    // Check if project exists and user is the owner
    const existingProject = await prisma.projects.findUnique({
      where: {
        id
      }
    });
    
    if (!existingProject) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }
    
    if (existingProject.ownerId !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this project'
      });
      return;
    }
    
    // Update project
    const updatedProject = await prisma.projects.update({
      where: {
        id
      },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        website: website !== undefined ? website : undefined,
        pitchDeckUrl: pitchDeckUrl !== undefined ? pitchDeckUrl : undefined,
        status: status !== undefined ? status as ProjectStatus : undefined
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        project: updatedProject
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (
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
    
    // Check if project exists and user is the owner
    const existingProject = await prisma.projects.findUnique({
      where: {
        id
      }
    });
    
    if (!existingProject) {
      res.status(404).json({
        status: 'error',
        message: 'Project not found'
      });
      return;
    }
    
    if (existingProject.ownerId !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this project'
      });
      return;
    }
    
    // Delete project
    await prisma.projects.delete({
      where: {
        id
      }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 