import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDefaultForm() {
  try {
    // Create the default form
    const form = await prisma.forms.create({
      data: {
        title: 'Project Submission Form',
        description: 'Default form for project submissions',
        version: 1,
        isActive: true,
        structure: {
          sections: [
            {
              id: 'generalInfo',
              title: 'General Information',
              fields: ['projectName', 'website', 'pitchDeck']
            },
            {
              id: 'technical',
              title: 'Technical Details',
              fields: ['blockchain', 'features', 'techStack', 'security']
            },
            {
              id: 'tgeDetails',
              title: 'TGE Details',
              fields: ['tgeDate', 'listingExchanges', 'tokenomics']
            },
            {
              id: 'funding',
              title: 'Funding',
              fields: ['previousFunding', 'fundingTarget', 'investmentTypes']
            },
            {
              id: 'services',
              title: 'Services',
              fields: ['requiredServices', 'serviceDetails']
            },
            {
              id: 'compliance',
              title: 'Compliance',
              fields: ['companyStructure', 'regulatoryCompliance', 'complianceStrategy']
            }
          ]
        },
        // Set a default admin user as the creator
        createdById: process.env.ADMIN_USER_ID || '1'
      }
    });

    console.log('Default form created:', form);
    console.log('Form ID:', form.id);
    console.log('Add this ID to your .env file as DEFAULT_FORM_ID=', form.id);

  } catch (error) {
    console.error('Error creating default form:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultForm(); 