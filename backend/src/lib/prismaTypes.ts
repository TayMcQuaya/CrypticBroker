import { PrismaClient as PC } from '@prisma/client/edge'
import type {
  ApplicationStatus,
  ProjectStatus,
  UserRole,
  OrganizationType,
  Prisma
} from '@prisma/client/edge'

export type PrismaClient = PC
export {
  ApplicationStatus,
  ProjectStatus,
  UserRole,
  OrganizationType,
  Prisma
} 