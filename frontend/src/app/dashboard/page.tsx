'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getProjects, Project } from '@/utils/api';
import { 
  FiPlus, 
  FiClock, 
  FiTrendingUp, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertCircle,
  FiCalendar
} from 'react-icons/fi';

interface ProjectStats {
  totalProjects: number;
  underReview: number;
  accepted: number;
  rejected: number;
}

interface ProjectsApiResponse {
  status: string;
  results: number;
  data: {
    projects: Project[];
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'UNDER_REVIEW':
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'UNDER_REVIEW':
      return FiClock;
    case 'ACCEPTED':
      return FiCheckCircle;
    case 'REJECTED':
      return FiXCircle;
    default:
      return FiAlertCircle;
  }
};

const initialStats: ProjectStats = {
  totalProjects: 0,
  underReview: 0,
  accepted: 0,
  rejected: 0
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching projects for user:', user.email);
        setLoading(true);
        const response = await getProjects() as { data: ProjectsApiResponse };
        console.log('Projects response:', response);
        
        // Extract projects from the nested response
        const fetchedProjects = response.data?.data?.projects || [];
        console.log('Fetched projects:', fetchedProjects);
        setProjects(fetchedProjects);
        
        // Calculate stats
        const newStats = fetchedProjects.reduce((acc: ProjectStats, project: Project) => {
          acc.totalProjects++;
          switch (project.status) {
            case 'UNDER_REVIEW':
              acc.underReview++;
              break;
            case 'ACCEPTED':
              acc.accepted++;
              break;
            case 'REJECTED':
              acc.rejected++;
              break;
          }
          return acc;
        }, {
          totalProjects: 0,
          underReview: 0,
          accepted: 0,
          rejected: 0
        });
        
        setStats(newStats);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        // Reset projects and stats on error
        setProjects([]);
        setStats(initialStats);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProjects();
    }
  }, [user, authLoading]);

  console.log('Dashboard render state:', { authLoading, loading, user: !!user, projectsCount: projects.length });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Please log in to view your dashboard.</p>
          <Link 
            href="/login"
            className="inline-flex items-center px-6 py-3 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {user?.firstName ? `Welcome, ${user.firstName}!` : 'Welcome to your Dashboard!'}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {user?.firstName ? 'Manage and track your project submissions' : 'Sign in to manage your projects'}
            </p>
          </div>
          <Link 
            href="/submit-project"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <FiPlus className="mr-2 h-5 w-5" />
            Submit New Project
          </Link>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
                <FiTrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Projects</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalProjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-50 rounded-lg">
                <FiClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Under Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.underReview}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-50 rounded-lg">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Accepted</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-red-50 rounded-lg">
                <FiXCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No projects submitted yet.</p>
                <Link 
                  href="/submit-project"
                  className="inline-flex items-center px-4 py-2 mt-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  <FiPlus className="mr-2 h-4 w-4" />
                  Submit your first project
                </Link>
              </div>
            ) : (
              projects.map((project) => {
                const StatusIcon = getStatusIcon(project.status);
                return (
                  <div key={project.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <h3 className="text-base font-medium text-gray-900">{project.name}</h3>
                        <span className={`ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          <StatusIcon className="mr-1.5 h-3.5 w-3.5" />
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <FiCalendar className="mr-1.5 h-4 w-4" />
                          {new Date(project.submittedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 