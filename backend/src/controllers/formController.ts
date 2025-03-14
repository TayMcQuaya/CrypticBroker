import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import type { PrismaClient } from '@prisma/client';

// Define the transaction client type
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

interface FormQuestion {
  text: string;
  description?: string;
  type: string;
  isRequired: boolean;
  options?: string[];
}

interface FormSection {
  title: string;
  description?: string;
  questions?: FormQuestion[];
}

interface CreateFormBody {
  title: string;
  description?: string;
  structure: any;
  sections?: FormSection[];
}

/**
 * @desc    Create a new form
 * @route   POST /api/forms
 * @access  Private (Admin only)
 */
export const createForm = async (
  req: Request<{}, {}, CreateFormBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, structure, sections } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    // Validate required fields
    if (!title || !structure) {
      res.status(400).json({
        status: 'error',
        message: 'Title and structure are required'
      });
      return;
    }
    
    // Create form with transaction to ensure sections are created properly
    const form = await prisma.$transaction(async (tx: TransactionClient) => {
      // Create the form
      const newForm = await tx.forms.create({
        data: {
          title,
          description,
          structure,
          createdBy: { connect: { id: userId } },
          isActive: true,
          version: 1
        }
      });
      
      // Create sections if provided
      if (sections && Array.isArray(sections) && sections.length > 0) {
        for (const [index, section] of sections.entries()) {
          await tx.form_sections.create({
            data: {
              form: { connect: { id: newForm.id } },
              title: section.title,
              description: section.description,
              order: index,
              form_questions: {
                createMany: {
                  data: section.questions?.map((question: FormQuestion, qIndex: number) => ({
                    text: question.text,
                    description: question.description,
                    type: question.type,
                    isRequired: question.isRequired || false,
                    order: qIndex,
                    options: question.options || null
                  })) || []
                }
              }
            }
          });
        }
      }
      
      return newForm;
    });
    
    // Fetch the complete form with sections and questions
    const completeForm = await prisma.forms.findUnique({
      where: { id: form.id },
      include: {
        form_sections: {
          include: {
            form_questions: true
          },
          orderBy: {
            order: 'asc'
          }
        },
        form_submissions: true,
        _count: {
          select: {
            form_sections: true,
            form_submissions: true
          }
        }
      }
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        form: completeForm
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all forms
 * @route   GET /api/forms
 * @access  Private
 */
export const getForms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const forms = await prisma.forms.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        description: true,
        version: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            form_sections: true,
            form_submissions: true
          }
        }
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: forms.length,
      data: {
        forms
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a form by ID
 * @route   GET /api/forms/:id
 * @access  Private
 */
export const getForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const form = await prisma.forms.findUnique({
      where: {
        id
      },
      include: {
        form_sections: {
          include: {
            form_questions: {
              orderBy: {
                order: 'asc'
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    if (!form) {
      res.status(404).json({
        status: 'error',
        message: 'Form not found'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        form
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a form
 * @route   PATCH /api/forms/:id
 * @access  Private (Admin only)
 */
export const updateForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, isActive } = req.body;
    
    // Check if form exists
    const existingForm = await prisma.forms.findUnique({
      where: {
        id
      }
    });
    
    if (!existingForm) {
      res.status(404).json({
        status: 'error',
        message: 'Form not found'
      });
      return;
    }
    
    // Update form
    const updatedForm = await prisma.forms.update({
      where: {
        id
      },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        form: updatedForm
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a form
 * @route   POST /api/forms/:id/submit
 * @access  Private
 */
export const submitForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, projectId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    // Check if form exists
    const form = await prisma.forms.findUnique({
      where: {
        id
      }
    });
    
    if (!form) {
      res.status(404).json({
        status: 'error',
        message: 'Form not found'
      });
      return;
    }
    
    // If projectId is provided, check if project exists and user is the owner
    if (projectId) {
      const project = await prisma.projects.findUnique({
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
          message: 'You do not have permission to submit for this project'
        });
        return;
      }
    }
    
    // Create form submission
    const submissionData = {
      formId: id,
      userId,
      projectId: projectId || null,
      formVersion: form.version,
      data,
      status: 'submitted'
    } satisfies Omit<PrismaClient.form_submissionsUncheckedCreateInput, 'id' | 'updatedAt'>;

    const submission = await prisma.form_submissions.create({
      data: submissionData
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        submission
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all submissions for a form
 * @route   GET /api/forms/:id/submissions
 * @access  Private (Admin only)
 */
export const getFormSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if form exists
    const form = await prisma.forms.findUnique({
      where: {
        id
      }
    });
    
    if (!form) {
      res.status(404).json({
        status: 'error',
        message: 'Form not found'
      });
      return;
    }
    
    // Get submissions
    const submissions = await prisma.form_submissions.findMany({
      where: {
        formId: id
      },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: submissions.length,
      data: {
        submissions
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a specific submission
 * @route   GET /api/forms/submissions/:id
 * @access  Private
 */
export const getSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
      return;
    }
    
    const submission = await prisma.form_submissions.findUnique({
      where: {
        id
      },
      include: {
        forms: true,
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        projects: true
      }
    });
    
    if (!submission) {
      res.status(404).json({
        status: 'error',
        message: 'Submission not found'
      });
      return;
    }
    
    // Check if user is authorized to view this submission
    // Only the submission owner or an admin can view it
    if (submission.userId !== userId && userRole !== 'ADMIN' && userRole !== 'INVESTOR') {
      res.status(403).json({
        status: 'error',
        message: 'You do not have permission to view this submission'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        submission
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all submissions for the authenticated user
 * @route   GET /api/forms/submissions/me
 * @access  Private
 */
export const getMySubmissions = async (
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
    
    const submissions = await prisma.form_submissions.findMany({
      where: {
        userId
      },
      include: {
        forms: {
          select: {
            id: true,
            title: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json({
      status: 'success',
      results: submissions.length,
      data: {
        submissions
      }
    });
  } catch (error) {
    next(error);
  }
}; 