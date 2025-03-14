import React from 'react';
import TextField from '../fields/TextField';
import TextArea from '../fields/TextArea';

export default function TGEDetailsStep() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Token Generation Event Details</h2>
      
      {/* TGE Date */}
      <TextField
        name="tgeDetails.tgeDate"
        label="TGE Date"
        type="date"
        required
        helpText="Expected date for the Token Generation Event"
      />

      {/* Expected Listing Exchanges */}
      <TextField
        name="tgeDetails.listingExchanges"
        label="Expected Listing Exchanges"
        required
        placeholder="e.g., Binance, Uniswap, PancakeSwap"
        helpText="List the exchanges where you plan to list your token"
      />

      {/* Market Making Provider */}
      <TextField
        name="tgeDetails.marketMakingProvider"
        label="Market Making Provider"
        placeholder="e.g., Wintermute, GSR, Alameda"
        helpText="If applicable, specify your market making provider"
      />

      {/* Total Supply */}
      <TextField
        name="tgeDetails.totalSupply"
        label="Total Supply"
        required
        placeholder="e.g., 1,000,000,000"
        helpText="Total number of tokens that will ever exist"
      />

      {/* Circulating Supply at TGE */}
      <TextField
        name="tgeDetails.circulatingSupply"
        label="Circulating Supply at TGE"
        required
        placeholder="e.g., 100,000,000"
        helpText="Number of tokens that will be in circulation at TGE"
      />

      {/* Vesting Schedule */}
      <TextArea
        name="tgeDetails.vestingSchedule"
        label="Vesting Schedule"
        required
        placeholder="Describe the vesting schedule for different token allocations..."
        helpText="Detail the vesting periods and unlock schedules for different token allocations"
      />

      {/* Deflationary/Incentive Mechanisms */}
      <TextArea
        name="tgeDetails.tokenomicsMechanisms"
        label="Deflationary/Incentive Mechanisms"
        placeholder="Describe any token burn mechanisms, staking rewards, or other tokenomics features..."
        helpText="Explain any mechanisms that affect token supply or provide incentives for holders"
      />
    </div>
  );
} 