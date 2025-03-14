import { z } from 'zod';

// Helper type for nested paths
export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

// Define the schema for the project submission form
export const formSchema = z.object({
  // General Info
  generalInfo: z.object({
    projectName: z.string().min(1, 'Project name is required'),
    websiteUrl: z.string()
      .refine(
        (val) => val === '' || val.startsWith('http'), 
        { message: 'Must be a valid URL starting with http:// or https://' }
      ),
    pitchDeckUrl: z.string()
      .refine(
        (val) => val === '' || val.startsWith('http'), 
        { message: 'Must be a valid URL starting with http:// or https://' }
      ),
    coreFounders: z.string().min(1, 'Core founders information is required'),
    projectHQ: z.string().min(1, 'Project HQ is required'),
  }),

  // TGE Details
  tgeDetails: z.object({
    tgeDate: z.string().optional(),
    listingExchanges: z.string().min(1, 'Listing exchanges are required'),
    marketMakingProvider: z.string().optional(),
    totalSupply: z.string().min(1, 'Total supply is required'),
    circulatingSupply: z.string().min(1, 'Circulating supply is required'),
    vestingSchedule: z.string().min(1, 'Vesting schedule is required'),
    tokenomicsMechanisms: z.string().optional(),
  }),

  // Funding
  funding: z.object({
    previousFunding: z.string().min(1, 'Previous funding information is required'),
    fundingTarget: z.string().min(1, 'Funding target is required'),
    investmentType: z.string().min(1, 'Investment type is required'),
    interestedVCs: z.string().optional(),
    keyMetrics: z.string().min(1, 'Key metrics are required'),
  }),

  // Technical Details
  technical: z.object({
    blockchain: z.string().min(1, 'Blockchain selection is required'),
    otherBlockchain: z.string().optional(),
    features: z.string().min(1, 'Features description is required'),
    techStack: z.string().min(1, 'Tech stack information is required'),
    security: z.string().min(1, 'Security information is required'),
  }),

  // Services
  services: z.object({
    requiredServices: z.string().min(1, 'Required services information is required'),
    serviceDetails: z.string().min(1, 'Service details are required'),
    additionalServices: z.string().optional(),
  }),

  // Compliance
  compliance: z.object({
    companyStructure: z.string().min(1, 'Company structure information is required'),
    regulatoryCompliance: z.string().min(1, 'Regulatory compliance information is required'),
    legalAdvisor: z.string().optional(),
    complianceStrategy: z.string().min(1, 'Compliance strategy is required'),
    riskFactors: z.string().min(1, 'Risk factors are required'),
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
export type FormDataPath = NestedKeyOf<FormData>;

// Export individual section types
export type GeneralInfo = FormData['generalInfo'];
export type TGEDetails = FormData['tgeDetails'];
export type Funding = FormData['funding'];
export type TechnicalDetails = FormData['technical'];
export type Services = FormData['services'];
export type Compliance = FormData['compliance'];
export type FinalQuestions = FormData['finalQuestions']; 