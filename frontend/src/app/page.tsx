import React from 'react';
import Link from 'next/link';
import Layout from '../components/layout/Layout';
import { FiBarChart2, FiLock, FiTrendingUp, FiUsers } from 'react-icons/fi';

// Feature card component
const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon 
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-md bg-blue-600 text-white mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default function HomePage() {
  return (
    <Layout>
      {/* Hero section */}
      <div className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Welcome to CrypticBroker
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          A comprehensive platform connecting promising blockchain projects with investors, exchanges, and essential services. Streamline your journey from ideation to funding.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/register" 
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Submit Your Project
          </Link>
          <Link 
            href="/login" 
            className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Investor Login
          </Link>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to connect blockchain innovation with capital and support services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              title="Smart Project Evaluation" 
              description="AI-powered screening and standardized evaluation process for blockchain projects seeking funding."
              icon={FiBarChart2}
            />
            <FeatureCard 
              title="Comprehensive Support" 
              description="Access to essential services including market making, exchange listings, and strategic guidance."
              icon={FiTrendingUp}
            />
            <FeatureCard 
              title="Secure Data Management" 
              description="Enterprise-grade security for sensitive project information and investor communications."
              icon={FiLock}
            />
            <FeatureCard 
              title="Ecosystem Connection" 
              description="Direct access to leading VCs, accelerators, and service providers in the blockchain space."
              icon={FiUsers}
            />
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="py-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Scale Your Blockchain Project?</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Join CrypticBroker to connect with quality capital and essential services for your project&apos;s success.
        </p>
        <Link 
          href="/register" 
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Your Project
        </Link>
      </div>
    </Layout>
  );
} 