import { z } from 'zod';

// Define the schema for the project submission form
export const formSchema = z.object({
  // General Project Information
  generalInfo: z.object({
    projectName: z.string().min(1, 'Project name is required'),
    websiteUrl: z.string().url('Please enter a valid URL'),
    pitchDeckUrl: z.string().url('Please enter a valid URL'),
    coreFounders: z.string(),
    projectHQ: z.string(),
  }),

  // Token Generation Event (TGE) Details
  tgeDetails: z.object({
    tgeDate: z.string().optional(),
    listingExchanges: z.enum(['CEX', 'DEX', 'BOTH', 'NOT_SURE']),
    marketMakingProvider: z.string().optional(),
    tokenomics: z.object({
      totalSupply: z.string(),
      circulatingSupply: z.string(),
      vestingSchedule: z.string(),
      incentiveMechanisms: z.string(),
    }),
  }),

  // Funding & Investment Needs
  funding: z.object({
    previousRounds: z.array(z.enum([
      'PRIVATE',
      'PRE_SEED',
      'SEED',
      'PUBLIC',
      'NONE',
      'OTHER'
    ])),
    fundraisingTarget: z.string(),
    investmentType: z.array(z.enum([
      'EQUITY',
      'SAFT',
      'STRATEGIC',
      'OTHER'
    ])),
    interestedVCs: z.string(),
    keyMetrics: z.string(),
  }),

  // Product & Technical Details
  technicalDetails: z.object({
    blockchain: z.array(z.enum([
      'ETHEREUM',
      'SOLANA',
      'ARBITRUM',
      'AVALANCHE',
      'BSC',
      'COSMOS',
      'NEAR',
      'OTHER'
    ])),
    productStage: z.enum([
      'MVP',
      'BETA',
      'LIVE_MAINNET',
      'CONCEPT',
      'SERIES_A',
      'SERIES_B'
    ]),
    usesOnChainData: z.boolean(),
  }),

  // Services Needed
  services: z.object({
    neededServices: z.array(z.enum([
      'MARKET_MAKING',
      'EXCHANGE_LISTING',
      'MARKETING_PR',
      'DEVELOPMENT',
      'EVENTS',
      'VC_INTROS',
      'BANKING',
      'DAO_GOVERNANCE',
      'COMMUNITY_GROWTH'
    ])),
    communitySize: z.string(),
    influencerEngagements: z.string(),
    marketingStrategy: z.string(),
    interestedInEvents: z.boolean(),
  }),

  // Compliance & Legal
  compliance: z.object({
    legalEntity: z.string(),
    regulations: z.string(),
    hasKycAml: z.boolean(),
  }),

  // Final Questions
  finalQuestions: z.object({
    uniquePosition: z.string(),
    biggestChallenges: z.string(),
    referralSource: z.enum([
      'TWITTER',
      'TELEGRAM',
      'EVENT',
      'REFERRAL',
      'OTHER'
    ]),
  }),
});

// Export type for the form data
export type FormData = z.infer<typeof formSchema>;

// Export individual section types
export type GeneralInfo = FormData['generalInfo'];
export type TGEDetails = FormData['tgeDetails'];
export type Funding = FormData['funding'];
export type TechnicalDetails = FormData['technicalDetails'];
export type Services = FormData['services'];
export type Compliance = FormData['compliance'];
export type FinalQuestions = FormData['finalQuestions']; 