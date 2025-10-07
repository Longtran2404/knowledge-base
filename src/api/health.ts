/**
 * Health Check API Endpoint
 * Provides system health status for monitoring
 */

import { supabase } from '../lib/supabase-config';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      responseTime?: number;
      error?: string;
    };
    auth: {
      status: 'ok' | 'error';
      error?: string;
    };
    storage: {
      status: 'ok' | 'error';
      error?: string;
    };
  };
  uptime: number;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}

const startTime = Date.now();

/**
 * Perform health check
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  const checks: HealthCheckResponse['checks'] = {
    database: { status: 'ok' },
    auth: { status: 'ok' },
    storage: { status: 'ok' },
  };

  // Check database connection
  try {
    const startDb = Date.now();
    const { error } = await supabase.from('nlc_accounts').select('count').limit(1);
    const responseTime = Date.now() - startDb;

    if (error) {
      checks.database = {
        status: 'error',
        error: error.message,
        responseTime,
      };
    } else {
      checks.database = {
        status: 'ok',
        responseTime,
      };
    }
  } catch (error: any) {
    checks.database = {
      status: 'error',
      error: error.message || 'Database connection failed',
    };
  }

  // Check auth service
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      checks.auth = {
        status: 'error',
        error: error.message,
      };
    }
  } catch (error: any) {
    checks.auth = {
      status: 'error',
      error: error.message || 'Auth service unavailable',
    };
  }

  // Check storage
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      checks.storage = {
        status: 'error',
        error: error.message,
      };
    }
  } catch (error: any) {
    checks.storage = {
      status: 'error',
      error: error.message || 'Storage service unavailable',
    };
  }

  // Determine overall status
  const hasErrors = Object.values(checks).some((check) => check.status === 'error');
  const status: HealthCheckResponse['status'] = hasErrors ? 'degraded' : 'ok';

  // Memory usage (if available)
  let memory: HealthCheckResponse['memory'];
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    const mem = (performance as any).memory;
    memory = {
      used: Math.round(mem.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(mem.totalJSHeapSize / 1024 / 1024), // MB
      percentage: Math.round((mem.usedJSHeapSize / mem.totalJSHeapSize) * 100),
    };
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
    checks,
    uptime: Date.now() - startTime,
    memory,
  };
}

/**
 * Simple ping check (faster, no external dependencies)
 */
export function ping(): { status: 'ok'; timestamp: string } {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}