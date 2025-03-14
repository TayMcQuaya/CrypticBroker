'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, register as registerApi, getCurrentUser } from '../utils/api';

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

interface UserResponse {
  status: string;
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
          
          // If token is expired or about to expire (less than 5 minutes left), refresh it
          if (expirationTime - currentTime < 5 * 60 * 1000) {
            console.log('Auth: Token is about to expire or expired');
            localStorage.removeItem('token');
            setUser(null);
            setLoading(false);
            return;
          }
          
          console.log('Auth: Getting current user...');
          const response = (await getCurrentUser() as unknown) as ApiResponse<UserResponse>;
          
          if (response?.data?.data?.user) {
            console.log('Auth: User loaded successfully');
            setUser(response.data.data.user);
            
            // Set up a timer to check token expiration
            const timeUntilExpiry = expirationTime - currentTime - (2 * 60 * 1000); // Check 2 minutes before expiry
            setTimeout(() => {
              loadUser(); // Recheck token when it's close to expiry
            }, timeUntilExpiry);
          } else {
            console.log('Auth: Invalid user data received');
            throw new Error('Invalid user data');
          }
        } catch (err) {
          console.error('Auth: Error loading user:', err);
          // Don't remove token on network errors
          if (err instanceof Error && !err.message.includes('Network Error')) {
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = (await loginApi(email, password) as unknown) as ApiResponse<AuthResponse>;
      localStorage.setItem('token', response.data.token);
      setUser(response.data.data.user);
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
      localStorage.setItem('token', response.data.token);
      setUser(response.data.data.user);
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