import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      server: 'ok',
      database: 'unknown',
    },
  };

  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('services')
      .select('id')
      .limit(1)
      .single();

    if (error) {
      healthCheck.checks.database = 'error';
      healthCheck.status = 'degraded';
      return NextResponse.json(healthCheck, { status: 503 });
    }

    healthCheck.checks.database = 'ok';
    return NextResponse.json(healthCheck);
  } catch (error) {
    console.error('Health check error:', error);
    healthCheck.checks.database = 'error';
    healthCheck.status = 'unhealthy';
    return NextResponse.json(healthCheck, { status: 503 });
  }
}