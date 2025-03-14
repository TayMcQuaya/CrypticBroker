'use client';

import React from 'react';
import ProjectSubmissionForm from '@/components/forms/ProjectSubmissionForm';

export default function SubmitProjectPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Submit Your Project</h1>
      <ProjectSubmissionForm />
    </div>
  );
} 