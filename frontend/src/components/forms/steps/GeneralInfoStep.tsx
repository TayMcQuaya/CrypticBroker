'use client';

import React from 'react';
import TextField from '../fields/TextField';
import { FormDataPath } from '../schema';

interface GeneralInfoStepProps {
  onFileUpload: (file: File, field: FormDataPath) => Promise<void>;
}

export default function GeneralInfoStep({ onFileUpload }: GeneralInfoStepProps) {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: FormDataPath) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileUpload(file, field);
    }
  };

  return (
    <div className="space-y-6">
      <TextField
        name="generalInfo.projectName"
        label="Project Name"
        required
        placeholder="Enter your project name"
        helpText="The name of your blockchain project"
      />

      <TextField
        name="generalInfo.websiteUrl"
        label="Website URL"
        type="url"
        required
        placeholder="https://your-project.com"
        helpText="Your project's website address"
      />

      <div className="space-y-2">
        <TextField
          name="generalInfo.pitchDeckUrl"
          label="Pitch Deck URL"
          type="url"
          required
          placeholder="https://drive.google.com/..."
          helpText="Link to your pitch deck (Google Drive, Dropbox, etc.)"
        />
        <div className="mt-1">
          <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={(e) => handleFileChange(e, 'generalInfo.pitchDeckUrl')}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>

      <TextField
        name="generalInfo.coreFounders"
        label="Core Founders & LinkedIn Profiles"
        required
        placeholder="Name - LinkedIn URL, Name - LinkedIn URL"
        helpText="List core team members with their LinkedIn profiles"
      />

      <TextField
        name="generalInfo.projectHQ"
        label="Project HQ / Jurisdiction"
        required
        placeholder="e.g., Singapore, Delaware, Switzerland"
        helpText="Primary location or jurisdiction of your project"
      />
    </div>
  );
} 