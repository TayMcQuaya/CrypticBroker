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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
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

/**
 * Save project as draft or submit
 */
export const submitProject = async (data: FormData, status: 'DRAFT' | 'SUBMITTED') => {
  // Transform form data to match backend structure, handling partial data
  const transformedData = {
    // General Info (required for draft)
    name: data.generalInfo?.projectName || 'Untitled Project', // Ensure name is never empty
    description: '', // Default empty description
    website: data.generalInfo?.websiteUrl || '',
    pitchDeckUrl: data.generalInfo?.pitchDeckUrl || '',
    status,

    // Technical Details (with defaults for required fields)
    blockchain: data.technical?.blockchain || 'ETHEREUM',
    otherBlockchain: '',
    features: data.technical?.features?.split(',').map(f => f.trim()) || [],
    techStack: data.technical?.techStack || '',
    security: data.technical?.security || '',

    // TGE Details (with defaults for required fields)
    tgeDate: data.tgeDetails?.tgeDate || '',
    listingExchanges: data.tgeDetails?.listingExchanges || '',
    marketMaker: data.tgeDetails?.marketMakingProvider || '',
    tokenomics: JSON.stringify({
      totalSupply: data.tgeDetails?.totalSupply || '',
      circulatingSupply: data.tgeDetails?.circulatingSupply || '',
      vestingSchedule: data.tgeDetails?.vestingSchedule || '',
    }),

    // Funding Details (with defaults for required fields)
    previousFunding: data.funding?.previousFunding?.split(',').map(f => f.trim()) || [],
    fundingTarget: data.funding?.fundingTarget || '0',
    investmentTypes: data.funding?.investmentType ? [data.funding.investmentType] : [],
    interestedVCs: '',
    keyMetrics: data.funding?.keyMetrics || '',

    // Services (with defaults for required fields)
    requiredServices: data.services?.requiredServices?.split(',').map(s => s.trim()) || [],
    serviceDetails: data.services?.serviceDetails || '',
    additionalServices: '',

    // Compliance (with defaults for required fields)
    companyStructure: data.compliance?.companyStructure || 'LLC',
    regulatoryCompliance: Array.isArray(data.compliance?.regulatoryCompliance) 
      ? data.compliance.regulatoryCompliance 
      : data.compliance?.regulatoryCompliance ? [data.compliance.regulatoryCompliance] : [],
    legalAdvisor: data.compliance?.legalAdvisor || '',
    complianceStrategy: data.compliance?.complianceStrategy || '',
    riskFactors: data.compliance?.riskFactors || ''
  };

  console.log('Sending project data:', transformedData);
  return api.post('/projects', transformedData);
};

// Default export for the API client
export default api; 