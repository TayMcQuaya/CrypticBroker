import { NextResponse } from 'next/server';

export async function GET() {
  // Always return a success response
  return NextResponse.json(
    { 
      status: 'ok',
      message: 'API is healthy',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
} 