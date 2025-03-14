import { PrismaClient } from '@prisma/client';
import { IProject, IProjectCreate, IProjectUpdate } from '../models/Project';

const prisma = new PrismaClient();

export class ProjectService {
  static async createProject(projectData: IProjectCreate): Promise<IProject> {
    const project = await prisma.project.create({
      data: projectData,
      include: {
        owner: false,
        applications: false,
        formSubmissions: false,
      },
    });

    return project as IProject;
  }

  static async getProject(projectId: string): Promise<IProject> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: false,
        applications: false,
        formSubmissions: false,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project as IProject;
  }

  static async updateProject(projectId: string, projectData: IProjectUpdate): Promise<IProject> {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: projectData,
      include: {
        owner: false,
        applications: false,
        formSubmissions: false,
      },
    });

    return project as IProject;
  }

  static async deleteProject(projectId: string): Promise<void> {
    await prisma.project.delete({
      where: { id: projectId },
    });
  }

  static async getProjectsByOrganization(organizationId: string): Promise<IProject[]> {
    const projects = await prisma.project.findMany({
      where: {
        owner: {
          organizations: {
            some: {
              organizationId
            }
          }
        }
      },
      include: {
        owner: false,
        applications: false,
        formSubmissions: false,
      },
    });

    return projects as IProject[];
  }

  static async getAllProjects(): Promise<IProject[]> {
    const projects = await prisma.project.findMany({
      include: {
        owner: false,
        applications: false,
        formSubmissions: false,
      },
    });

    return projects as IProject[];
  }
} 