import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config, rateLimitConfig } from '../config';

// Rate limiting middleware
export const createRateLimit = (options: Partial<typeof rateLimitConfig> = {}) => {
  return rateLimit({
    ...rateLimitConfig,
    ...options,
  });
};

// Specific rate limiters for different endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
  },
});

export const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 API requests per windowMs
});

export const uploadRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 upload requests per windowMs
  message: {
    error: 'Too many upload attempts from this IP, please try again later.',
  },
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "fonts.googleapis.com",
        "*.fontawesome.com",
      ],
      fontSrc: [
        "'self'",
        "fonts.gstatic.com",
        "*.fontawesome.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "*.cloudfront.net",
        "*.amazonaws.com",
        "media.licdn.com",
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-eval'", // Required for development
        "*.sentry.io",
        "*.hotjar.com",
      ],
      connectSrc: [
        "'self'",
        "*.sentry.io",
        "*.hotjar.com",
        "api.linkedin.com",
        "www.linkedin.com",
      ],
      frameSrc: [
        "'none'"
      ],
      objectSrc: [
        "'none'"
      ],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some third-party services
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

// API Key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('x-api-key');
  const schedulerKey = config.SCHEDULER_API_KEY;

  // Skip validation if no API key is configured
  if (!schedulerKey) {
    return next();
  }

  if (!apiKey || apiKey !== schedulerKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
    });
  }

  next();
};

// IP whitelist middleware (for production scheduler endpoints)
export const ipWhitelist = (allowedIPs: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Skip in development
    if (config.NODE_ENV === 'development') {
      return next();
    }

    if (!clientIP || !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied from this IP address',
      });
    }

    next();
  };
};

// Request sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS protection - remove script tags
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// CORS preflight handler
export const handlePreflight = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '3600');
    return res.status(200).end();
  }
  next();
};

// Security middleware bundle
export const applySecurity = (app: any) => {
  // Basic security headers
  app.use(securityHeaders);
  
  // Handle preflight requests
  app.use(handlePreflight);
  
  // Rate limiting
  if (config.ENABLE_RATE_LIMITING) {
    app.use('/api/', apiRateLimit);
    app.use('/api/auth/', authRateLimit);
    app.use('/api/upload/', uploadRateLimit);
  }
  
  // Input sanitization
  app.use(sanitizeInput);
};