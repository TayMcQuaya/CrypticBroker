'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { FiArrowRight, FiCheck, FiShield, FiTrendingUp } from 'react-icons/fi';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-8">
              Welcome to CrypticBroker
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
              The bridge between promising blockchain projects and investment opportunities
            </p>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              We connect innovative crypto projects with venture capital, accelerators, and essential support services through our AI-powered evaluation platform
            </p>
            {user ? (
              <div className="space-y-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md text-lg font-medium"
                >
                  Go to Dashboard
                  <FiArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <p className="text-gray-600">
                  Welcome back, {user.firstName}! Check your project status and updates.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-x-4">
                  <Link
                    href="/register"
                    className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md text-lg font-medium"
                  >
                    Get Started
                    <FiArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md text-lg font-medium"
                  >
                    Login
                  </Link>
                </div>
                <p className="text-gray-600">
                  Submit your project and connect with leading investors and accelerators
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Choose CrypticBroker?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Streamlined project evaluation and funding process powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FiTrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Smart Evaluation
            </h3>
            <p className="text-gray-600">
              AI-powered project assessment and standardized data collection for faster funding decisions
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FiCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Complete Support
            </h3>
            <p className="text-gray-600">
              Access to funding, exchange listings, market making, and strategic guidance
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <FiShield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Trusted Network
            </h3>
            <p className="text-gray-600">
              Connect with verified investors, accelerators, and service providers in the crypto ecosystem
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Scale Your Blockchain Project?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join CrypticBroker to connect with the right investors and support services
            </p>
            {user ? (
              <Link
                href="/submit-project"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-sm hover:shadow-md text-lg font-medium"
              >
                Submit a Project
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-sm hover:shadow-md text-lg font-medium"
              >
                Get Started Now
                <FiArrowRight className="ml-2 h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 