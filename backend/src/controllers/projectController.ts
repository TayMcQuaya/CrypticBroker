import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { ProjectStatus, PrismaClient } from '@prisma/client';

// Define the enums locally since they're not exported by Prisma
enum BlockchainType {
  ETHEREUM = 'ETHEREUM',
  BINANCE_SMART_CHAIN = 'BINANCE_SMART_CHAIN',
  POLYGON = 'POLYGON',
  SOLANA = 'SOLANA',
  AVALANCHE = 'AVALANCHE',
  OTHER = 'OTHER'
}

enum InvestmentType {
  EQUITY = 'EQUITY',
  TOKEN = 'TOKEN',
  HYBRID = 'HYBRID',
  OTHER = 'OTHER'
}

enum CompanyStructure {
  LLC = 'LLC',
  CORPORATION = 'CORPORATION',
  FOUNDATION = 'FOUNDATION',
  DAO = 'DAO',
  OTHER = 'OTHER'
}

interface ProjectRequestBody {
  name: string;
  description?: string;
  website?: string;
  pitchDeckUrl?: string;
  coreFounders?: string;
  projectHQ?: string;
  status?: ProjectStatus;
  blockchain?: BlockchainType;
  otherBlockchain?: string;
  features?: string[];
  techStack?: string;
  security?: string;
  tgeDate?: string;
  listingExchanges?: string;
  marketMaker?: string;
  tokenomics?: string;
  tokenomicsMechanisms?: string;
  previousFunding?: string[];
  fundingTarget?: string;
  investmentTypes?: InvestmentType[];
  interestedVCs?: string;
  keyMetrics?: string;
  requiredServices?: string[];
  serviceDetails?: string;
  additionalServices?: string;
  companyStructure?: CompanyStructure;
  regulatoryCompliance?: string[];
  legalAdvisor?: string;
  complianceStrategy?: string;
  riskFactors?: string;
  uniquePosition?: string;
  biggestChallenges?: string;
  referralSource?: string;
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
    
    console.log('Creating project with request body:', JSON.stringify(req.body, null, 2));
    console.log('General info fields:', {
      name: req.body.name,
      coreFounders: req.body.coreFounders,
      projectHQ: req.body.projectHQ
    });
    
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
    
    // Create project using all provided fields
    const projectData = {
      name: req.body.name,
      description: req.body.description || '',
      website: req.body.website || '',
      pitchDeckUrl: req.body.pitchDeckUrl || '',
      coreFounders: req.body.coreFounders || '',
      projectHQ: req.body.projectHQ || '',
      status: req.body.status || ProjectStatus.DRAFT,
      blockchain: req.body.blockchain || null,
      otherBlockchain: req.body.otherBlockchain || '',
      features: req.body.features || [],
      techStack: req.body.techStack || '',
      security: req.body.security || '',
      tgeDate: req.body.tgeDate || '',
      listingExchanges: req.body.listingExchanges || '',
      marketMaker: req.body.marketMaker || '',
      // Parse tokenomics JSON string and extract individual fields
      ...(req.body.tokenomics ? {
        ...JSON.parse(req.body.tokenomics),
        tokenomics: req.body.tokenomics, // Keep the original JSON string
        tokenomicsMechanisms: JSON.parse(req.body.tokenomics).vestingSchedule || ''
      } : {
        totalSupply: '',
        circulatingSupply: '',
        vestingSchedule: '',
        tokenomics: '',
        tokenomicsMechanisms: ''
      }),
      previousFunding: req.body.previousFunding || [],
      fundingTarget: req.body.fundingTarget || '',
      investmentTypes: (req.body.investmentTypes || []).filter(type => 
        ['EQUITY', 'TOKEN', 'HYBRID', 'OTHER'].includes(type)
      ) as InvestmentType[],
      interestedVCs: req.body.interestedVCs || '',
      keyMetrics: req.body.keyMetrics || '',
      requiredServices: req.body.requiredServices || [],
      serviceDetails: req.body.serviceDetails || '',
      additionalServices: req.body.additionalServices || '',
      companyStructure: req.body.companyStructure || null,
      regulatoryCompliance: req.body.regulatoryCompliance || [],
      legalAdvisor: req.body.legalAdvisor || '',
      complianceStrategy: req.body.complianceStrategy || '',
      riskFactors: req.body.riskFactors || '',
      uniquePosition: req.body.uniquePosition || '',
      biggestChallenges: req.body.biggestChallenges || '',
      referralSource: req.body.referralSource || '',
      ownerId: userId
    };
    
    console.log('Creating project with data:', JSON.stringify(projectData, null, 2));
    
    const project = await prisma.projects.create({
      data: projectData
    });
    
    console.log('Created project:', JSON.stringify(project, null, 2));
    
    res.status(201).json({
      status: 'success',
      data: {
        project
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
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
    const { 
      name, description, website, pitchDeckUrl, status,
      blockchain, otherBlockchain, features, techStack,
      security, tgeDate, listingExchanges, marketMaker,
      tokenomics, previousFunding, fundingTarget,
      investmentTypes, interestedVCs, keyMetrics,
      requiredServices, serviceDetails, additionalServices,
      companyStructure, regulatoryCompliance, legalAdvisor,
      complianceStrategy, riskFactors
    } = req.body;
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
        status: status !== undefined ? status as ProjectStatus : undefined,
        blockchain: blockchain !== undefined ? blockchain : undefined,
        otherBlockchain: otherBlockchain !== undefined ? otherBlockchain : undefined,
        features: features !== undefined ? features : undefined,
        techStack: techStack !== undefined ? techStack : undefined,
        security: security !== undefined ? security : undefined,
        tgeDate: tgeDate !== undefined ? tgeDate : undefined,
        listingExchanges: listingExchanges !== undefined ? listingExchanges : undefined,
        marketMaker: marketMaker !== undefined ? marketMaker : undefined,
        tokenomics: tokenomics !== undefined ? tokenomics : undefined,
        previousFunding: previousFunding !== undefined ? previousFunding : undefined,
        fundingTarget: fundingTarget !== undefined ? fundingTarget : undefined,
        investmentTypes: investmentTypes ? 
          (investmentTypes.filter((type: string) => 
            ['EQUITY', 'TOKEN', 'HYBRID', 'OTHER'].includes(type)
          ) as InvestmentType[]) : undefined,
        interestedVCs: interestedVCs !== undefined ? interestedVCs : undefined,
        keyMetrics: keyMetrics !== undefined ? keyMetrics : undefined,
        requiredServices: requiredServices !== undefined ? requiredServices : undefined,
        serviceDetails: serviceDetails !== undefined ? serviceDetails : undefined,
        additionalServices: additionalServices !== undefined ? additionalServices : undefined,
        companyStructure: companyStructure !== undefined ? companyStructure : undefined,
        regulatoryCompliance: regulatoryCompliance !== undefined ? regulatoryCompliance : undefined,
        legalAdvisor: legalAdvisor !== undefined ? legalAdvisor : undefined,
        complianceStrategy: complianceStrategy !== undefined ? complianceStrategy : undefined,
        riskFactors: riskFactors !== undefined ? riskFactors : undefined
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