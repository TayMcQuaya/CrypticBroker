// @ts-ignore
const { PrismaClient } = require('@prisma/client');
import type { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

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

    // Transform data for Excel, following the form's chronological order
    const excelData = projects.map((project: any) => ({
      // General Info Section
      'Project Name': project.name,
      'Website URL': project.website,
      'Pitch Deck URL': project.pitchDeckUrl,
      'Core Founders': project.coreFounders,
      'Project HQ': project.projectHQ,

      // TGE Details Section
      'TGE Date': project.tgeDate,
      'Listing Exchanges': project.listingExchanges,
      'Market Maker': project.marketMaker,
      'Total Supply': project.totalSupply,
      'Circulating Supply': project.circulatingSupply,
      'Vesting Schedule': project.vestingSchedule,
      'Tokenomics Mechanisms': project.tokenomicsMechanisms,

      // Funding Section
      'Previous Funding': project.previousFunding.join(', '),
      'Funding Target': project.fundingTarget,
      'Investment Types': project.investmentTypes.join(', '),
      'Interested VCs': project.interestedVCs,
      'Key Metrics': project.keyMetrics,

      // Technical Details Section
      'Blockchain': project.blockchain,
      'Other Blockchain': project.otherBlockchain,
      'Features': project.features.join(', '),
      'Tech Stack': project.techStack,
      'Security': project.security,

      // Services Section
      'Required Services': project.requiredServices.join(', '),
      'Service Details': project.serviceDetails,
      'Additional Services': project.additionalServices,

      // Compliance Section
      'Company Structure': project.companyStructure,
      'Regulatory Compliance': project.regulatoryCompliance.join(', '),
      'Legal Advisor': project.legalAdvisor,
      'Compliance Strategy': project.complianceStrategy,
      'Risk Factors': project.riskFactors,

      // Final Questions Section
      'Unique Position': project.uniquePosition,
      'Biggest Challenges': project.biggestChallenges,
      'Referral Source': project.referralSource,

      // Metadata
      'Status': project.status,
      'Created At': project.createdAt.toISOString(),
      'Updated At': project.updatedAt.toISOString(),
      'Owner ID': project.ownerId,
      'Number of Applications': project.applications.length,
      'Number of Form Submissions': project.form_submissions.length
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add column widths for better readability
    const colWidths = Object.keys(excelData[0] || {}).map(() => ({ wch: 20 }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Projects');

    // Create exports directory if it doesn't exist
    const exportDir = path.join(__dirname, '../../../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Write to file with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportPath = path.join(exportDir, `projects-${timestamp}.xlsx`);
    XLSX.writeFile(wb, exportPath);

    console.log(`Projects exported successfully to: ${exportPath}`);

  } catch (error) {
    console.error('Error exporting projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportProjects(); 