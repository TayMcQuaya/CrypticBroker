import React from 'react';
import TextField from '../fields/TextField';
import CheckboxGroup from '../fields/CheckboxGroup';
import TextArea from '../fields/TextArea';

export default function FundingStep() {
  return (
    <div className="space-y-6">
      <CheckboxGroup
        name="previousFunding"
        label="Previous Funding Rounds"
        options={[
          { value: 'PRIVATE', label: 'Private' },
          { value: 'PRE_SEED', label: 'Pre-Seed' },
          { value: 'SEED', label: 'Seed' },
          { value: 'PUBLIC', label: 'Public' },
          { value: 'NONE', label: 'None Yet' },
        ]}
        columns={2}
        helpText="Select all that apply"
      />

      <TextField
        name="fundingTarget"
        label="Current Fundraising Target ($USD)"
        required
        placeholder="e.g., 1,000,000"
        helpText="Enter the amount you're looking to raise in this round"
      />

      <CheckboxGroup
        name="investmentType"
        label="Type of Investment Sought"
        options={[
          { value: 'EQUITY', label: 'Equity' },
          { value: 'SAFT', label: 'SAFT' },
          { value: 'STRATEGIC', label: 'Strategic' },
          { value: 'OTHER', label: 'Other' },
        ]}
        required
        columns={2}
        helpText="Select all that apply"
      />

      <TextField
        name="interestedVCs"
        label="Top 3 VCs/Funds Currently Interested"
        placeholder="List the names of VCs/Funds if any"
        helpText="Optional - helps us understand your current fundraising progress"
      />

      <TextArea
        name="keyMetrics"
        label="Key Metrics to Showcase to Investors"
        required
        placeholder={`Share your key metrics such as:
- Total Value Locked (TVL)
- Monthly Active Users
- Transaction Volume
- Revenue (if applicable)
- Growth Rate
- Other relevant KPIs`}
        helpText="Quantifiable metrics that demonstrate your project's traction"
        rows={6}
      />
    </div>
  );
} 