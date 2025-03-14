'use client';

import React from 'react';
import ProjectSubmissionForm from '@/components/forms/ProjectSubmissionForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SubmitProjectPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/dashboard" 
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-center mt-6">Submit Your Project</h1>
      <ProjectSubmissionForm />
    </div>
  );
} 