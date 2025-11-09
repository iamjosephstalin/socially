import winston from 'winston';
import { config } from '../config';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: {
    service: 'socially-backend',
    environment: config.NODE_ENV,
  },
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: config.NODE_ENV === 'development' 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : logFormat,
    }),
  ],
});

// Add file transports for production
if (config.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    })
  );
}

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Request Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Audit logging
export const auditLog = {
  userAction: (userId: string, action: string, details?: any) => {
    logger.info('User Action', {
      type: 'AUDIT',
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  systemEvent: (event: string, details?: any) => {
    logger.info('System Event', {
      type: 'SYSTEM',
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },

  securityEvent: (event: string, details?: any) => {
    logger.warn('Security Event', {
      type: 'SECURITY',
      event,
      details,
      timestamp: new Date().toISOString(),
    });
  },
};

export default logger;