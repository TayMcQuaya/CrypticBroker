'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { checkTokenStatus } from '@/utils/api';

interface TokenStatus {
  valid: boolean;
  message: string;
  expiresAt?: string;
  timeLeftMinutes?: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<TokenStatus | null>(null);

  const handleCheckToken = () => {
    const status = checkTokenStatus();
    setTokenInfo(status);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={handleCheckToken}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
          >
            Check Token
          </button>
          <Link 
            href="/submit-project"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Submit New Project
          </Link>
        </div>
      </div>

      {tokenInfo && (
        <div className={`mb-6 p-4 rounded-lg ${tokenInfo.valid ? 'bg-green-100' : 'bg-red-100'}`}>
          <h3 className="font-semibold">{tokenInfo.valid ? 'Token is valid' : 'Token is invalid'}</h3>
          <p>{tokenInfo.message}</p>
          {tokenInfo.expiresAt && <p>Expires at: {tokenInfo.expiresAt}</p>}
        </div>
      )}

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