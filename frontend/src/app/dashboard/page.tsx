'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link 
          href="/submit-project"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Submit New Project
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.firstName}!</h2>
        {user?.role === 'PROJECT_OWNER' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Ready to submit your project? Click the button above to get started with our comprehensive project submission form.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 