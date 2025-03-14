// Organization interfaces
export interface IOrganization {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrganizationCreate {
  name: string;
  description?: string;
  website?: string;
  logo?: string;
}

export interface IOrganizationUpdate {
  name?: string;
  description?: string;
  website?: string;
  logo?: string;
}

export interface IOrganizationResponse extends IOrganization {
  _count?: {
    users: number;
    projects: number;
  };
} 