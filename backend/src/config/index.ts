import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('3002'),
  
  // Database
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // LinkedIn OAuth
  LINKEDIN_CLIENT_ID: z.string().min(1, 'LinkedIn Client ID is required'),
  LINKEDIN_CLIENT_SECRET: z.string().min(1, 'LinkedIn Client Secret is required'),
  LINKEDIN_REDIRECT_URI: z.string().url('Invalid LinkedIn redirect URI'),
  
  // Frontend
  FRONTEND_URL: z.string().url('Invalid frontend URL'),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // AWS
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Email
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // Payments
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  
  // Feature Flags
  ENABLE_RATE_LIMITING: z.string().transform(val => val === 'true').default('true'),
  ENABLE_EMAIL_VERIFICATION: z.string().transform(val => val === 'true').default('true'),
  ENABLE_PAYMENTS: z.string().transform(val => val === 'true').default('false'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).pipe(z.number().positive()).default('5242880'),
  UPLOAD_DIR: z.string().default('./uploads'),
  
  // Security
  SCHEDULER_API_KEY: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),
});

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(envValidation.error.format());
  process.exit(1);
}

export const config = envValidation.data;

// Derived configurations
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isStaging = config.NODE_ENV === 'staging';

// Database configuration
export const database = {
  url: config.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
};

// CORS configuration
export const corsOptions = {
  origin: config.CORS_ORIGINS 
    ? config.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5173',
        config.FRONTEND_URL
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.ENABLE_RATE_LIMITING ? 100 : 0, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
};

// Session configuration
export const sessionConfig = {
  secret: config.JWT_SECRET,
  name: 'socially.sid',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: isProduction ? 'strict' : 'lax' as const,
  },
};

// File upload configuration
export const uploadConfig = {
  maxFileSize: config.MAX_FILE_SIZE,
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  uploadDir: config.UPLOAD_DIR,
};

// Logging configuration
export const loggingConfig = {
  level: config.LOG_LEVEL,
  format: isProduction ? 'json' : 'combined',
  transports: isProduction 
    ? ['file', 'console']
    : ['console'],
};

// Health check configuration
export const healthCheck = {
  timeout: 5000, // 5 seconds
  interval: 30000, // 30 seconds
};

export default config;