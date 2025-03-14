import React from 'react';
import CheckboxGroup from '../fields/CheckboxGroup';
import TextArea from '../fields/TextArea';

export default function ServicesStep() {
  return (
    <div className="space-y-6">
      <CheckboxGroup
        name="requiredServices"
        label="Required Support Services"
        required
        options={[
          { value: 'LEGAL', label: 'Legal Advisory' },
          { value: 'MARKETING', label: 'Marketing & PR' },
          { value: 'COMMUNITY', label: 'Community Management' },
          { value: 'EXCHANGE', label: 'Exchange Listing' },
          { value: 'MARKET_MAKING', label: 'Market Making' },
          { value: 'TOKENOMICS', label: 'Tokenomics Design' },
          { value: 'TECH', label: 'Technical Development' },
          { value: 'AUDIT', label: 'Smart Contract Audit' },
        ]}
        columns={2}
        helpText="Select all services you need support with"
      />

      <TextArea
        name="services.serviceDetails"
        label="Service Details"
        required
        placeholder={`Please specify your needs for each selected service:
- Timeline requirements
- Specific requirements or preferences
- Current progress or existing partnerships
- Budget allocation if any`}
        rows={6}
        helpText="Provide detailed information about your service needs"
      />

      <TextArea
        name="services.additionalServices"
        label="Additional Services"
        placeholder="Describe any other support services not listed above that you might need"
        rows={4}
        helpText="Optional - List any other services you're looking for"
      />
    </div>
  );
} 