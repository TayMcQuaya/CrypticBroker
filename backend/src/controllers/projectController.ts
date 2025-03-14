import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { BlockchainType, CompanyStructure, InvestmentType, ProjectStatus } from '@prisma/client';

interface CreateProjectData {
  name: string;
  description?: string;
  website?: string;
  pitchDeckUrl?: string;
  status: ProjectStatus;
  blockchain: BlockchainType;
  otherBlockchain?: string;
  features: string[];
  techStack: string;
  security: string;
  tgeDate?: string;
  listingExchanges: string;
  marketMaker?: string;
  tokenomics: string;
  previousFunding: string[];
  fundingTarget: string;
  investmentTypes: InvestmentType[];
  interestedVCs?: string;
  keyMetrics: string;
  requiredServices: string[];
  serviceDetails: string;
  additionalServices?: string;
  companyStructure: CompanyStructure;
  regulatoryCompliance: string[];
  legalAdvisor?: string;
  complianceStrategy: string;
  riskFactors: string;
  ownerId: string;
}

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (
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
    
    // Validate required fields
    if (!req.body.name) {
      res.status(400).json({
        status: 'error',
        message: 'Project name is required'
      });
      return;
    }
    
    // Create project with default values for required fields
    const projectData: CreateProjectData = {
      ...req.body,
      status: 'DRAFT',
      ownerId: userId,
      blockchain: req.body.blockchain || 'ETHEREUM',
      features: req.body.features || [],
      techStack: req.body.techStack || '',
      security: req.body.security || '',
      listingExchanges: req.body.listingExchanges || '',
      tokenomics: req.body.tokenomics || '',
      previousFunding: req.body.previousFunding || [],
      fundingTarget: req.body.fundingTarget || '0',
      investmentTypes: req.body.investmentTypes || [],
      keyMetrics: req.body.keyMetrics || '',
      requiredServices: req.body.requiredServices || [],
      serviceDetails: req.body.serviceDetails || '',
      companyStructure: req.body.companyStructure || 'LLC',
      regulatoryCompliance: req.body.regulatoryCompliance || [],
      complianceStrategy: req.body.complianceStrategy || '',
      riskFactors: req.body.riskFactors || ''
    };
    
    const project = await prisma.project.create({
      data: projectData
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
    
    const projects = await prisma.project.findMany({
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
    
    const project = await prisma.project.findUnique({
      where: {
        id
      },
      include: {
        applications: true,
        formSubmissions: true
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
    const existingProject = await prisma.project.findUnique({
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
    const updatedProject = await prisma.project.update({
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
    const existingProject = await prisma.project.findUnique({
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
    await prisma.project.delete({
      where: {
        id
      }
    });
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}; 