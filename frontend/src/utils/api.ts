import axios from 'axios';
import type { FormData } from '../components/forms/schema';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'PROJECT_OWNER' | 'INVESTOR' | 'ACCELERATOR';
  createdAt: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'PROJECT_OWNER' | 'INVESTOR' | 'ACCELERATOR';
}

// Types for file upload responses
export interface FileUploadResponse {
  status: string;
  data: {
    file: {
      filename: string;
      originalname: string;
      path: string;
      size: number;
      mimetype: string;
    };
  };
}

export interface MultipleFileUploadResponse {
  status: string;
  data: {
    files: {
      filename: string;
      originalname: string;
      path: string;
      size: number;
      mimetype: string;
    }[];
  };
}

// Define a proper error type for axios errors
interface ApiErrorResponse {
  status: number;
  data: unknown;
}

interface ApiErrorConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
}

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add a longer timeout for all requests
  timeout: 15000, // 15 seconds
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Remove the automatic API path correction that's causing double prefixes
    // If we need to add /api prefix, it should be done in the endpoint definitions directly
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Show error message to user
      if (typeof window !== 'undefined') {
        // Create a persistent error message
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '20px';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translateX(-50%)';
        errorDiv.style.backgroundColor = '#f44336';
        errorDiv.style.color = 'white';
        errorDiv.style.padding = '15px 20px';
        errorDiv.style.borderRadius = '4px';
        errorDiv.style.zIndex = '9999';
        errorDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        errorDiv.textContent = 'Authentication error: ' + (error.response?.data?.message || 'Your session has expired. Redirecting to login...');
        document.body.appendChild(errorDiv);
        
        // Token expired or invalid - redirect after delay
        setTimeout(() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }, 3000); // 3 second delay
      }
    }
    return Promise.reject(error);
  }
);

// AUTH API CALLS

/**
 * Register a new user
 */
export const register = (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}) => {
  return api.post('/auth/signup', userData);
};

/**
 * Login a user
 */
export const login = (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};

/**
 * Get the current user profile
 */
export const getCurrentUser = () => {
  return api.get('/users/me');
};

/**
 * Logout the user (client-side only)
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

// FILE UPLOAD API CALLS

/**
 * Upload a single file
 */
export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<FileUploadResponse>('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (files: File[]): Promise<MultipleFileUploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<MultipleFileUploadResponse>('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete an uploaded file
 */
export const deleteUploadedFile = async (filename: string): Promise<void> => {
  await api.delete(`/upload/${filename}`);
};

// PROJECT API CALLS

// Define the type for the transformed project data
export interface ProjectSubmissionData {
  name: string;
  description: string;
  website: string;
  pitchDeckUrl: string;
  coreFounders: string;
  projectHQ: string;
  status: string;
  blockchain: string;
  otherBlockchain?: string;
  features: string[];
  techStack: string;
  security: string;
  tgeDate?: string;
  listingExchanges?: string;
  marketMaker?: string;
  tokenomics: string;
  tokenomicsMechanisms?: string;
  previousFunding: string[];
  fundingTarget: string;
  investmentTypes: string[];
  interestedVCs?: string;
  keyMetrics?: string;
  requiredServices: string[];
  serviceDetails?: string;
  additionalServices?: string;
  companyStructure: string;
  regulatoryCompliance: string[];
  legalAdvisor?: string;
  complianceStrategy: string;
  riskFactors?: string;
  uniquePosition: string;
  biggestChallenges: string;
  referralSource: string;
}

/**
 * Save project as draft or submit
 */
export const submitProject = async (data: ProjectSubmissionData) => {
  try {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting project:', error);
    throw error;
  }
};

/**
 * Debug function to check token status
 */
export const checkTokenStatus = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found in localStorage');
    return { valid: false, message: 'No token found' };
  }
  
  try {
    // Parse the token payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeLeft = expirationTime - currentTime;
    
    console.log('Token payload:', payload);
    console.log('Expiration time:', new Date(expirationTime).toLocaleString());
    console.log('Current time:', new Date(currentTime).toLocaleString());
    console.log('Time left:', Math.floor(timeLeft / 1000 / 60), 'minutes');
    
    return { 
      valid: timeLeft > 0,
      message: timeLeft > 0 
        ? `Token is valid for ${Math.floor(timeLeft / 1000 / 60)} more minutes` 
        : 'Token has expired',
      expiresAt: new Date(expirationTime).toLocaleString(),
      timeLeftMinutes: Math.floor(timeLeft / 1000 / 60)
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return { valid: false, message: 'Invalid token format' };
  }
};

// Default export for the API client
export default api; 