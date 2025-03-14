import { NextRequest, NextResponse } from 'next/server';

// Mock database for projects
const projects: Array<{
  id: string;
  name: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: string | number | boolean | string[] | Record<string, unknown>;
}> = [];

export async function POST(request: NextRequest) {
  try {
    console.log('Next.js API route: POST /api/projects called');
    
    // Parse the request body
    const data = await request.json();
    console.log('Received data:', data);
    
    // Generate a random ID
    const id = Math.random().toString(36).substring(2, 15);
    
    // Create project with timestamp
    const project = {
      id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock database
    projects.push(project);
    console.log('Project saved:', project.id);
    
    // Return success
    return NextResponse.json(
      { 
        status: 'success',
        message: 'Project created successfully',
        data: { project }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in Next.js API route POST /api/projects:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to create project'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('Next.js API route: PUT /api/projects called');
    
    // Parse the request body
    const data = await request.json();
    console.log('Received data:', data);
    
    // Generate a random ID if not provided
    const id = data.id || Math.random().toString(36).substring(2, 15);
    
    // Create or update project with timestamp
    const project = {
      id,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    // Update in mock database or add if not exists
    const index = projects.findIndex(p => p.id === id);
    if (index >= 0) {
      projects[index] = project;
      console.log('Project updated:', project.id);
    } else {
      project.createdAt = new Date().toISOString();
      projects.push(project);
      console.log('Project created:', project.id);
    }
    
    // Return success
    return NextResponse.json(
      { 
        status: 'success',
        message: 'Project updated successfully',
        data: { project }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in Next.js API route PUT /api/projects:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to update project'
      },
      { status: 500 }
    );
  }
} 