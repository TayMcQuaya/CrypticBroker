import React from 'react';
import TextField from '../fields/TextField';
import SelectField from '../fields/SelectField';
import TextArea from '../fields/TextArea';
import CheckboxGroup from '../fields/CheckboxGroup';

export default function TechnicalDetailsStep() {
  return (
    <div className="space-y-6">
      <SelectField
        name="technical.blockchain"
        label="Primary Blockchain"
        required
        options={[
          { value: 'ETHEREUM', label: 'Ethereum' },
          { value: 'BSC', label: 'BNB Chain (BSC)' },
          { value: 'POLYGON', label: 'Polygon' },
          { value: 'SOLANA', label: 'Solana' },
          { value: 'AVALANCHE', label: 'Avalanche' },
          { value: 'OTHER', label: 'Other' },
        ]}
        placeholder="Select your main blockchain"
      />

      <TextField
        name="technical.otherBlockchain"
        label="Other Blockchain"
        placeholder="Specify if you selected 'Other' above"
        helpText="Only fill this if you selected 'Other' above"
      />

      <CheckboxGroup
        name="technical.features"
        label="Key Technical Features"
        required
        options={[
          { value: 'SMART_CONTRACTS', label: 'Smart Contracts' },
          { value: 'NFT', label: 'NFT Integration' },
          { value: 'DEFI', label: 'DeFi Protocols' },
          { value: 'CROSS_CHAIN', label: 'Cross-chain Bridge' },
          { value: 'DAO', label: 'DAO Governance' },
          { value: 'AI_ML', label: 'AI/ML Integration' },
        ]}
        columns={2}
        helpText="Select all that apply"
      />

      <TextArea
        name="technical.techStack"
        label="Technical Stack"
        required
        placeholder={`Describe your tech stack, including:
- Programming Languages
- Frameworks
- Development Tools
- Testing Tools
- Infrastructure/Hosting`}
        rows={6}
        helpText="List the main technologies used in your project"
      />

      <TextArea
        name="technical.security"
        label="Security Measures"
        required
        placeholder={`Detail your security approach:
- Smart Contract Audits (if any)
- Security Partners
- Bug Bounty Programs
- Insurance Coverage`}
        rows={4}
        helpText="Describe measures taken to ensure project security"
      />
    </div>
  );
} 