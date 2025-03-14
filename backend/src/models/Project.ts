import { ProjectStatus } from '@prisma/client';
import type { Project } from '@prisma/client';

type BlockchainType = 'ETHEREUM' | 'BINANCE_SMART_CHAIN' | 'POLYGON' | 'SOLANA' | 'AVALANCHE' | 'OTHER';
type InvestmentType = 'EQUITY' | 'TOKEN' | 'HYBRID' | 'OTHER';
type CompanyStructure = 'LLC' | 'CORPORATION' | 'FOUNDATION' | 'DAO' | 'OTHER';

export interface IProject extends Omit<Project, 'owner' | 'applications' | 'formSubmissions'> {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  pitchDeckUrl: string | null;
  status: ProjectStatus;
  blockchain: BlockchainType;
  otherBlockchain: string | null;
  features: string[];
  techStack: string;
  security: string;
  tgeDate: string | null;
  listingExchanges: string;
  marketMaker: string | null;
  tokenomics: string;
  previousFunding: string[];
  fundingTarget: string;
  investmentTypes: InvestmentType[];
  interestedVCs: string | null;
  keyMetrics: string;
  requiredServices: string[];
  serviceDetails: string;
  additionalServices: string | null;
  companyStructure: CompanyStructure;
  regulatoryCompliance: string[];
  legalAdvisor: string | null;
  complianceStrategy: string;
  riskFactors: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectCreate {
  name: string;
  description?: string;
  website?: string;
  pitchDeckUrl?: string;
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

export interface IProjectUpdate {
  name?: string;
  description?: string;
  website?: string;
  pitchDeckUrl?: string;
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
} 