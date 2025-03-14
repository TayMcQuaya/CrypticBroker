'use client';

import React from 'react';
import ProjectSubmissionForm from '@/components/forms/ProjectSubmissionForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SubmitProjectPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        href="/" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      <h1 className="text-3xl font-bold mb-6 text-center">Submit Your Project</h1>
      <ProjectSubmissionForm />
    </div>
  );
} 