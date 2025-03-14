import React from 'react';
import TextField from '../fields/TextField';

export default function GeneralInfoStep() {
  return (
    <div className="space-y-6">
      <TextField
        name="generalInfo.projectName"
        label="Project Name"
        required
        placeholder="Enter your project name"
      />

      <TextField
        name="generalInfo.websiteUrl"
        label="Website URL"
        type="url"
        required
        placeholder="https://your-project.com"
      />

      <TextField
        name="generalInfo.pitchDeckUrl"
        label="Pitch Deck URL"
        type="url"
        required
        placeholder="Link to your pitch deck (Google Drive, Notion, etc.)"
        helpText="Please ensure the link is accessible"
      />

      <TextField
        name="generalInfo.coreFounders"
        label="Core Founders & LinkedIn Profiles"
        required
        placeholder="List core founders and their LinkedIn profiles"
        helpText="Format: Name - LinkedIn URL, Name - LinkedIn URL"
      />

      <TextField
        name="generalInfo.projectHQ"
        label="Project HQ / Jurisdiction"
        required
        placeholder="Where is your project based?"
      />
    </div>
  );
} 