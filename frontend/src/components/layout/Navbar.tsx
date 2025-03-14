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
    <nav className="bg-blue-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-white font-bold text-xl">
                CrypticBroker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  pathname === '/'
                    ? 'border-white text-white'
                    : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                <FiHome className="mr-1" />
                Home
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className={`${
                    pathname === '/dashboard'
                      ? 'border-white text-white'
                      : 'border-transparent text-blue-100 hover:border-blue-300 hover:text-white'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <FiBarChart2 className="mr-1" />
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <div className="relative ml-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-white">{user.username}</span>
                    <button
                      onClick={logout}
                      className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      aria-label="Logout"
                    >
                      <FiLogOut className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <Link
                    href="/login"
                    className="text-blue-100 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-sm font-medium"
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
                className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
        <div className="pt-2 pb-3 space-y-1">
          <Link
            href="/"
            className={`${
              pathname === '/'
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            } block px-3 py-2 rounded-md text-base font-medium`}
            onClick={closeMenu}
          >
            <div className="flex items-center">
              <FiHome className="mr-2" />
              Home
            </div>
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`${
                pathname === '/dashboard'
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <FiBarChart2 className="mr-2" />
                Dashboard
              </div>
            </Link>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-blue-700">
          {user ? (
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-800 flex items-center justify-center text-white">
                  <FiUser className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-white">{user.username}</div>
                <div className="text-sm font-medium text-blue-100">{user.email}</div>
              </div>
              <button
                onClick={logout}
                className="ml-auto flex-shrink-0 bg-blue-600 p-1 rounded-full text-blue-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
              >
                <span className="sr-only">Logout</span>
                <FiLogOut className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 px-5">
              <Link
                href="/login"
                className="block text-center text-blue-100 hover:bg-blue-700 hover:text-white px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block text-center bg-white text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md text-base font-medium"
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