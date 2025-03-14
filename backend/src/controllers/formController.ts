import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';

interface FormQuestion {
  text: string;
  description?: string;
  type: string;
  isRequired: boolean;
  options?: string[];
}

/**
 * @desc    Create a new form
 * @route   POST /api/forms
 * @access  Private (Admin only)
 */
export const createForm = async (
  req: Request,
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
    const form = await prisma.$transaction(async (tx) => {
      // Create the form
      const newForm = await tx.form.create({
        data: {
          title,
          description,
          structure,
          createdById: userId,
          isActive: true
        }
      });
      
      // Create sections if provided
      if (sections && Array.isArray(sections) && sections.length > 0) {
        for (const [index, section] of sections.entries()) {
          await tx.formSection.create({
            data: {
              formId: newForm.id,
              title: section.title,
              description: section.description,
              order: index,
              questions: {
                create: section.questions?.map((question: FormQuestion, qIndex: number) => ({
                  text: question.text,
                  description: question.description,
                  type: question.type,
                  isRequired: question.isRequired || false,
                  order: qIndex,
                  options: question.options || null
                })) || []
              }
            }
          });
        }
      }
      
      return newForm;
    });
    
    // Fetch the complete form with sections and questions
    const completeForm = await prisma.form.findUnique({
      where: { id: form.id },
      include: {
        sections: {
          include: {
            questions: true
          },
          orderBy: {
            order: 'asc'
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
    const forms = await prisma.form.findMany({
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
            sections: true,
            submissions: true
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
    
    const form = await prisma.form.findUnique({
      where: {
        id
      },
      include: {
        sections: {
          include: {
            questions: {
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
    const existingForm = await prisma.form.findUnique({
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
    const updatedForm = await prisma.form.update({
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
    const form = await prisma.form.findUnique({
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
          message: 'You do not have permission to submit for this project'
        });
        return;
      }
    }
    
    // Create form submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: id,
        userId,
        projectId: projectId || undefined,
        formVersion: form.version,
        data,
        status: 'submitted'
      }
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
    const form = await prisma.form.findUnique({
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
    const submissions = await prisma.formSubmission.findMany({
      where: {
        formId: id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        project: {
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
    
    const submission = await prisma.formSubmission.findUnique({
      where: {
        id
      },
      include: {
        form: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        project: true
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
    
    const submissions = await prisma.formSubmission.findMany({
      where: {
        userId
      },
      include: {
        form: {
          select: {
            id: true,
            title: true
          }
        },
        project: {
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