import { NextRequest, NextResponse } from 'next/server';

// Metrics storage
interface MetricsData {
  timestamp: number;
  responseTime: number;
  statusCode: number;
  method: string;
  path: string;
  userAgent?: string;
  ip?: string;
  error?: string;
}

interface AlertConfig {
  type: 'response_time' | 'error_rate' | 'status_code';
  threshold: number;
  window: number; // in minutes
  enabled: boolean;
}

class MonitoringService {
  private static instance: MonitoringService;
  private metrics: MetricsData[] = [];
  private alerts: AlertConfig[] = [];
  private maxMetrics = 10000; // Keep last 10k metrics

  private constructor() {
    // Default alert configurations
    this.alerts = [
      {
        type: 'response_time',
        threshold: 5000, // 5 seconds
        window: 5,
        enabled: true,
      },
      {
        type: 'error_rate',
        threshold: 0.1, // 10% error rate
        window: 10,
        enabled: true,
      },
      {
        type: 'status_code',
        threshold: 500, // 5xx errors
        window: 5,
        enabled: true,
      },
    ];

    // Cleanup old metrics every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Record a metric
  recordMetric(metric: Omit<MetricsData, 'timestamp'>): void {
    const metricWithTimestamp: MetricsData = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(metricWithTimestamp);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Check alerts
    this.checkAlerts();
  }

  // Track performance metrics
  trackPerformance(name: string, duration: number, metadata?: Record<string, unknown>): void {
    this.recordMetric({
      responseTime: duration,
      statusCode: 200, // Performance metrics are always successful
      method: 'PERFORMANCE',
      path: name,
      ...metadata,
    });
  }

  // Track business metrics
  trackBusinessMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    this.recordMetric({
      responseTime: value,
      statusCode: 200,
      method: 'BUSINESS_METRIC',
      path: name,
      ...metadata,
    });
  }

  // Track custom metrics
  trackMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    this.recordMetric({
      responseTime: value,
      statusCode: 200,
      method: 'CUSTOM_METRIC',
      path: name,
      ...metadata,
    });
  }

  // Get metrics for a time window
  getMetrics(windowMinutes: number = 60): MetricsData[] {
    const windowMs = windowMinutes * 60 * 1000;
    const cutoff = Date.now() - windowMs;

    return this.metrics.filter(metric => metric.timestamp > cutoff);
  }

  // Get aggregated metrics
  getAggregatedMetrics(windowMinutes: number = 60) {
    const metrics = this.getMetrics(windowMinutes);
    const totalRequests = metrics.length;

    if (totalRequests === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        statusCodes: {},
        slowestRequests: [],
      };
    }

    const avgResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const errors = metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = errors / totalRequests;

    const statusCodes: Record<number, number> = {};
    metrics.forEach(metric => {
      statusCodes[metric.statusCode] = (statusCodes[metric.statusCode] || 0) + 1;
    });

    const slowestRequests = metrics.sort((a, b) => b.responseTime - a.responseTime).slice(0, 10);

    return {
      totalRequests,
      avgResponseTime: Math.round(avgResponseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      statusCodes,
      slowestRequests,
    };
  }

  // Check alerts
  private checkAlerts(): void {
    this.alerts.forEach(alert => {
      if (!alert.enabled) return;

      const metrics = this.getMetrics(alert.window);

      switch (alert.type) {
        case 'response_time':
          const avgResponseTime =
            metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
          if (avgResponseTime > alert.threshold) {
            this.triggerAlert(
              `High response time: ${avgResponseTime.toFixed(2)}ms (threshold: ${alert.threshold}ms)`
            );
          }
          break;

        case 'error_rate':
          const errors = metrics.filter(m => m.statusCode >= 400).length;
          const errorRate = errors / metrics.length;
          if (errorRate > alert.threshold) {
            this.triggerAlert(
              `High error rate: ${(errorRate * 100).toFixed(2)}% (threshold: ${alert.threshold * 100}%)`
            );
          }
          break;

        case 'status_code':
          const serverErrors = metrics.filter(m => m.statusCode >= alert.threshold).length;
          if (serverErrors > 0) {
            this.triggerAlert(
              `${serverErrors} server errors (${alert.threshold}+) in last ${alert.window} minutes`
            );
          }
          break;
      }
    });
  }

  // Trigger alert (in production, this would send to monitoring service)
  private triggerAlert(message: string): void {
    console.error(`🚨 ALERT: ${message}`);

    // In production, send to monitoring service like DataDog, New Relic, etc.
    // Example:
    // sendToMonitoringService('alert', { message, timestamp: Date.now() })
  }

  // Cleanup old metrics
  private cleanup(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneHourAgo);
  }

  // Health check
  getHealthStatus() {
    const metrics = this.getAggregatedMetrics(5); // Last 5 minutes

    return {
      status: metrics.errorRate < 0.1 ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      metrics,
    };
  }
}

// Global monitoring instance
export const monitoring = MonitoringService.getInstance();

// Middleware for monitoring API requests
export function withMonitoring(handler: Function) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const startTime = Date.now();

    try {
      const response = await handler(request, ...args);
      const responseTime = Date.now() - startTime;

      // Record successful metric
      monitoring.recordMetric({
        responseTime,
        statusCode: response.status,
        method: request.method,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      });

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Record error metric
      monitoring.recordMetric({
        responseTime,
        statusCode: 500,
        method: request.method,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };
}

// Health check endpoint
export async function healthCheck() {
  const health = monitoring.getHealthStatus();

  const status = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(
    {
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: health.uptime,
      memory: {
        used: Math.round(health.memory.heapUsed / 1024 / 1024),
        total: Math.round(health.memory.heapTotal / 1024 / 1024),
        external: Math.round(health.memory.external / 1024 / 1024),
      },
      metrics: health.metrics,
    },
    { status }
  );
}
