import { Request, Response, NextFunction } from 'express';
import { performance } from 'perf_hooks';
import { logger } from './logger';

// Performance monitoring
interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  statusCode: number;
  timestamp: Date;
}

const performanceMetrics: PerformanceMetrics[] = [];

export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const startTime = performance.now();
  
  res.on('finish', () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const metrics: PerformanceMetrics = {
      endpoint: req.route?.path || req.path,
      method: req.method,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      statusCode: res.statusCode,
      timestamp: new Date(),
    };
    
    // Store metrics (in production, send to monitoring service)
    performanceMetrics.push(metrics);
    
    // Log slow requests
    if (duration > 1000) { // Log requests taking more than 1 second
      logger.warn('Slow Request Detected', {
        ...metrics,
        threshold: '1000ms',
      });
    }
    
    // Keep only last 1000 metrics in memory
    if (performanceMetrics.length > 1000) {
      performanceMetrics.splice(0, 100);
    }
  });
  
  next();
};

// Health check endpoint data
export const healthMetrics = {
  uptime: () => process.uptime(),
  memory: () => process.memoryUsage(),
  cpu: () => process.cpuUsage(),
  timestamp: () => new Date().toISOString(),
  version: () => process.env.npm_package_version || '1.0.0',
};

// Get performance statistics
export const getPerformanceStats = () => {
  if (performanceMetrics.length === 0) {
    return {
      totalRequests: 0,
      averageResponseTime: 0,
      slowRequests: 0,
      errorRate: 0,
    };
  }
  
  const totalRequests = performanceMetrics.length;
  const averageResponseTime = performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0) / totalRequests;
  const slowRequests = performanceMetrics.filter(metric => metric.duration > 1000).length;
  const errorRequests = performanceMetrics.filter(metric => metric.statusCode >= 400).length;
  const errorRate = (errorRequests / totalRequests) * 100;
  
  return {
    totalRequests,
    averageResponseTime: Math.round(averageResponseTime * 100) / 100,
    slowRequests,
    errorRate: Math.round(errorRate * 100) / 100,
  };
};

// Error tracking
export const errorTracking = (error: Error, req: Request, res: Response, next: NextFunction) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  };
  
  logger.error('Unhandled Error', errorInfo);
  
  // In production, send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: errorInfo });
  }
  
  next(error);
};

// Custom metrics collection
class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  
  incrementCounter(name: string, value = 1) {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
  }
  
  setGauge(name: string, value: number) {
    this.gauges.set(name, value);
  }
  
  recordHistogram(name: string, value: number) {
    const values = this.histograms.get(name) || [];
    values.push(value);
    // Keep only last 100 values
    if (values.length > 100) {
      values.splice(0, 10);
    }
    this.histograms.set(name, values);
  }
  
  getMetrics() {
    const histogramStats: Record<string, any> = {};
    
    this.histograms.forEach((values, name) => {
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        histogramStats[name] = {
          count: values.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p90: sorted[Math.floor(sorted.length * 0.9)],
          p99: sorted[Math.floor(sorted.length * 0.99)],
        };
      }
    });
    
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: histogramStats,
      timestamp: new Date().toISOString(),
    };
  }
  
  reset() {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }
}

export const metrics = new MetricsCollector();

// Business metrics middleware
export const businessMetrics = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const userId = (req as any).user?.id;
    
    // Track API usage
    metrics.incrementCounter('api_requests_total');
    metrics.incrementCounter(`api_requests_${req.method.toLowerCase()}`);
    
    if (res.statusCode >= 400) {
      metrics.incrementCounter('api_errors_total');
    }
    
    // Track user activity
    if (userId) {
      metrics.incrementCounter('authenticated_requests');
      
      // Track specific business actions
      if (req.path.includes('/posts') && req.method === 'POST') {
        metrics.incrementCounter('posts_created');
      }
      
      if (req.path.includes('/automations') && req.method === 'POST') {
        metrics.incrementCounter('automations_created');
      }
    }
  });
  
  next();
};