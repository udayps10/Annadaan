import { NextRequest, NextResponse } from 'next/server';
import { healthCheck } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const health = await healthCheck();
    
    if (health.healthy) {
      return NextResponse.json(health, { status: 200 });
    } else {
      return NextResponse.json(health, { status: 503 });
    }
  } catch (error) {
    console.error('Health check endpoint error:', error);
    return NextResponse.json(
      { 
        healthy: false, 
        error: 'Health check failed',
        timestamp: new Date().toISOString() 
      }, 
      { status: 503 }
    );
  }
}
