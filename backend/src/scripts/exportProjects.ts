import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';

const prisma = new PrismaClient();

async function exportProjects() {
  try {
    // Fetch all projects with related data
    const projects = await prisma.projects.findMany({
      include: {
        applications: true,
        form_submissions: true
      }
    });

    // Transform data for Excel
    const excelData = projects.map((project: any) => ({
      'Project Name': project.name,
      'Website': project.website,
      'Pitch Deck URL': project.pitchDeckUrl,
      'Status': project.status,
      'Blockchain': project.blockchain,
      'Other Blockchain': project.otherBlockchain,
      'Features': project.features.join(', '),
      'Tech Stack': project.techStack,
      'Security': project.security,
      'TGE Date': project.tgeDate,
      'Listing Exchanges': project.listingExchanges,
      'Market Maker': project.marketMaker,
      'Tokenomics': project.tokenomics,
      'Previous Funding': project.previousFunding.join(', '),
      'Funding Target': project.fundingTarget,
      'Investment Types': project.investmentTypes.join(', '),
      'Interested VCs': project.interestedVCs,
      'Key Metrics': project.keyMetrics,
      'Required Services': project.requiredServices.join(', '),
      'Service Details': project.serviceDetails,
      'Additional Services': project.additionalServices,
      'Company Structure': project.companyStructure,
      'Regulatory Compliance': project.regulatoryCompliance.join(', '),
      'Legal Advisor': project.legalAdvisor,
      'Compliance Strategy': project.complianceStrategy,
      'Risk Factors': project.riskFactors,
      'Created At': project.createdAt.toISOString(),
      'Updated At': project.updatedAt.toISOString(),
      'Owner ID': project.ownerId,
      'Number of Applications': project.applications.length,
      'Number of Form Submissions': project.form_submissions.length
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');

    // Write to file
    const exportPath = path.join(__dirname, '../../../exports/projects.xlsx');
    XLSX.writeFile(wb, exportPath);

    console.log(`Projects exported successfully to: ${exportPath}`);

  } catch (error) {
    console.error('Error exporting projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportProjects(); 