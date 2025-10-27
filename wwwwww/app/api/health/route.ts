import { healthCheck } from '@/lib/monitoring';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return await healthCheck();
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
