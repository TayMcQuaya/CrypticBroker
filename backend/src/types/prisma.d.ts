declare module '@prisma/client' {
  import { PrismaClient as PC } from '../../node_modules/.prisma/client'
  import { ApplicationStatus, ProjectStatus, UserRole, OrganizationType } from '../../node_modules/.prisma/client'
  
  export const Prisma: any
  export type PrismaClient = PC
  export { ApplicationStatus, ProjectStatus, UserRole, OrganizationType }
}

declare module '.prisma/client' {
  export * from '../../node_modules/.prisma/client'
} 