import React from 'react';
import TextField from '../fields/TextField';
import SelectField from '../fields/SelectField';
import TextArea from '../fields/TextArea';
import CheckboxGroup from '../fields/CheckboxGroup';

export default function ComplianceStep() {
  return (
    <div className="space-y-6">
      <SelectField
        name="companyStructure"
        label="Company Structure"
        required
        options={[
          { value: 'FOUNDATION', label: 'Foundation' },
          { value: 'LLC', label: 'Limited Liability Company (LLC)' },
          { value: 'CORPORATION', label: 'Corporation' },
          { value: 'DAO', label: 'DAO' },
          { value: 'OTHER', label: 'Other' },
        ]}
        placeholder="Select your company structure"
      />

      <CheckboxGroup
        name="regulatoryCompliance"
        label="Regulatory Compliance Status"
        required
        options={[
          { value: 'AML', label: 'AML Policy' },
          { value: 'KYC', label: 'KYC Procedures' },
          { value: 'LEGAL_OPINION', label: 'Legal Opinion' },
          { value: 'LICENSES', label: 'Required Licenses' },
          { value: 'NONE', label: 'None Yet' },
        ]}
        columns={2}
        helpText="Select all that apply"
      />

      <TextField
        name="legalAdvisor"
        label="Legal Advisor/Firm"
        placeholder="Name of your legal representation if any"
        helpText="Optional - Who provides your legal counsel?"
      />

      <TextArea
        name="complianceStrategy"
        label="Compliance Strategy"
        required
        placeholder={`Detail your compliance approach:
- Jurisdictions you're targeting/avoiding
- Compliance measures in place
- Planned compliance steps
- Risk mitigation strategies`}
        rows={6}
        helpText="Describe your approach to regulatory compliance"
      />

      <TextArea
        name="riskFactors"
        label="Key Risk Factors"
        required
        placeholder={`List main risk factors:
- Regulatory risks
- Technical risks
- Market risks
- Operational risks
- Mitigation strategies`}
        rows={6}
        helpText="Identify and explain key risks and how you plan to address them"
      />
    </div>
  );
} 