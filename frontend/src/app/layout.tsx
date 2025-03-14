import React from 'react';
import type { Metadata } from 'next';
import AuthProviderWrapper from '../components/auth/AuthProviderWrapper';
import './globals.css';

export const metadata: Metadata = {
  title: 'CrypticBroker - Cryptocurrency Trading Platform',
  description: 'A modern cryptocurrency trading simulation platform',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AuthProviderWrapper>
          {children}
        </AuthProviderWrapper>
      </body>
    </html>
  );
} 