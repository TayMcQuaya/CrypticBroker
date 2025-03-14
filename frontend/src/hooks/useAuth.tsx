'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, register as registerApi } from '../utils/api';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PROJECT_OWNER' | 'INVESTOR' | 'ACCELERATOR';
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
}

// Backend response types
interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

// API response types
type ApiResponse<T> = {
  data: T;
};

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PROJECT_OWNER' | 'INVESTOR' | 'ACCELERATOR';
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Create Context
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

// Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if there's a logged-in user on initial load
  useEffect(() => {
    const loadUser = async () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        console.log('Auth: Checking token...', !!token);
        
        if (!token) {
          setLoading(false);
          setUser(null);
          return;
        }

        try {
          // Check token expiration
          const tokenData = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
          const currentTime = Date.now();
          
          console.log('Auth: Token expiration check', {
            expirationTime,
            currentTime,
            timeLeft: (expirationTime - currentTime) / 1000 / 60 + ' minutes'
          });
          
          // If token is expired, remove it and clear user
          if (currentTime >= expirationTime) {
            console.log('Auth: Token is expired');
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            return;
          }
          
          // Extract user data from token
          const userData = {
            id: tokenData.id,
            email: tokenData.email,
            firstName: tokenData.firstName,
            lastName: tokenData.lastName,
            role: tokenData.role,
            createdAt: tokenData.createdAt,
            updatedAt: tokenData.updatedAt,
            isEmailVerified: tokenData.isEmailVerified
          };
          
          setUser(userData);
          setLoading(false);
          
          // Set up a timer to check token expiration
          const timeUntilExpiry = expirationTime - currentTime;
          if (timeUntilExpiry > 0) {
            const timer = setTimeout(() => {
              console.log('Auth: Token expired, logging out');
              localStorage.removeItem('token');
              setUser(null);
            }, timeUntilExpiry);
            
            // Cleanup timer on unmount
            return () => clearTimeout(timer);
          }
          
        } catch (err) {
          console.error('Auth: Error loading user:', err);
          localStorage.removeItem('token');
          setUser(null);
          setLoading(false);
        }
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await loginApi(email, password) as unknown) as ApiResponse<AuthResponse>;
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      // Extract user data from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userData = {
        id: tokenData.id,
        email: tokenData.email,
        firstName: tokenData.firstName,
        lastName: tokenData.lastName,
        role: tokenData.role,
        createdAt: tokenData.createdAt,
        updatedAt: tokenData.updatedAt,
        isEmailVerified: tokenData.isEmailVerified
      };
      
      setUser(userData);
      router.push('/dashboard');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await registerApi(data) as unknown) as ApiResponse<AuthResponse>;
      const token = response.data.token;
      localStorage.setItem('token', token);
      
      // Extract user data from token
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const userData = {
        id: tokenData.id,
        email: tokenData.email,
        firstName: tokenData.firstName,
        lastName: tokenData.lastName,
        role: tokenData.role,
        createdAt: tokenData.createdAt,
        updatedAt: tokenData.updatedAt,
        isEmailVerified: tokenData.isEmailVerified
      };
      
      setUser(userData);
      
      // Set up token expiration check
      const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      if (timeUntilExpiry > 0) {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            setUser(null);
            router.push('/login');
          }
        }, timeUntilExpiry);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => useContext(AuthContext);

export default useAuth; 