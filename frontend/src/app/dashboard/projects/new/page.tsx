'use client';

import React from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import ProjectSubmissionForm from '../../../../components/forms/ProjectSubmissionForm';

export default function NewProjectPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submit New Project</h1>
          <p className="mt-1 text-sm text-gray-500">
            Please fill out the form below to submit your project for review.
          </p>
        </div>
        <ProjectSubmissionForm />
      </div>
    </DashboardLayout>
  );
} 