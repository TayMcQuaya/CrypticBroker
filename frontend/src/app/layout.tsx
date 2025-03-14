import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProviderWrapper from '@/components/auth/AuthProviderWrapper';
import Navbar from '@/components/layout/Navbar';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CrypticBroker',
  description: 'Your trusted platform for crypto project management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderWrapper>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
            <Navbar />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <footer className="bg-white/80 backdrop-blur-sm shadow-inner py-6">
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
          <Toaster position="top-right" />
        </AuthProviderWrapper>
      </body>
    </html>
  );
} 