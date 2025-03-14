'use client';

import React from 'react';
import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ 
  children
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white shadow-inner py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CrypticBroker. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              This platform is for educational purposes only and does not involve real cryptocurrency trading.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 