'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { FiMenu, FiX, FiUser, FiLogOut, FiHome, FiBarChart2 } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/" className="text-white font-bold text-2xl hover:text-blue-100 transition-colors">
                CrypticBroker
              </Link>
            </div>
            
            <div className="hidden sm:flex items-center space-x-6">
              <Link
                href="/"
                className={`${
                  pathname === '/'
                    ? 'bg-blue-700/50 text-white'
                    : 'text-blue-100 hover:bg-blue-700/30 hover:text-white'
                } px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2`}
              >
                <FiHome className="h-4 w-4" />
                <span>Home</span>
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className={`${
                    pathname === '/dashboard'
                      ? 'bg-blue-700/50 text-white'
                      : 'text-blue-100 hover:bg-blue-700/30 hover:text-white'
                  } px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2`}
                >
                  <FiBarChart2 className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            <div className="hidden sm:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 px-3 py-2 text-blue-100">
                    <div className="h-8 w-8 rounded-full bg-blue-700/50 flex items-center justify-center">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-blue-100 hover:bg-blue-700/30 hover:text-white transition-all duration-200"
                    aria-label="Logout"
                  >
                    <FiLogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-lg text-blue-100 hover:bg-blue-700/30 hover:text-white transition-all duration-200 text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-2 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-all duration-200 text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-lg text-blue-100 hover:bg-blue-700/30 hover:text-white transition-all duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`${
              pathname === '/'
                ? 'bg-blue-700/50 text-white'
                : 'text-blue-100 hover:bg-blue-700/30 hover:text-white'
            } block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200`}
            onClick={closeMenu}
          >
            <div className="flex items-center space-x-2">
              <FiHome className="h-5 w-5" />
              <span>Home</span>
            </div>
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`${
                pathname === '/dashboard'
                  ? 'bg-blue-700/50 text-white'
                  : 'text-blue-100 hover:bg-blue-700/30 hover:text-white'
              } block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200`}
              onClick={closeMenu}
            >
              <div className="flex items-center space-x-2">
                <FiBarChart2 className="h-5 w-5" />
                <span>Dashboard</span>
              </div>
            </Link>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-blue-700/30">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center px-3 py-2">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-700/50 flex items-center justify-center text-white">
                    <FiUser className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-blue-100">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="flex items-center w-full px-3 py-2 text-blue-100 hover:bg-blue-700/30 hover:text-white rounded-lg transition-all duration-200"
              >
                <FiLogOut className="h-5 w-5 mr-2" />
                <span className="text-base font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                className="block w-full px-3 py-2 text-center text-blue-100 hover:bg-blue-700/30 hover:text-white rounded-lg transition-all duration-200 text-base font-medium"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block w-full px-3 py-2 text-center bg-white text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 text-base font-medium"
                onClick={closeMenu}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;