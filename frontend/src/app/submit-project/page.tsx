'use client';

import React from 'react';
import ProjectSubmissionForm from '@/components/forms/ProjectSubmissionForm';

export default function SubmitProjectPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Submit Your Project</h1>
        <ProjectSubmissionForm />
      </div>
    </div>
  );
} 