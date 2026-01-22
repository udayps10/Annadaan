/**
 * Centralized Configuration Management
 * All environment variables and constants are validated and exported from here
 */

// Validate required environment variables
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'SMTP_USER',
  'SMTP_PASS'
] as const;

function validateEnvironment(): void {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate JWT_SECRET is not the default insecure value
  if (process.env.JWT_SECRET === 'dev-secret-change-in-production') {
    throw new Error(
      'JWT_SECRET is set to the default insecure value. ' +
      'Please update it to a strong, randomly generated secret in production.'
    );
  }

  // Validate JWT_SECRET length
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security.');
  }
}

// Run validation on module load
validateEnvironment();

// Database Configuration
export const DATABASE_CONFIG = {
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '50', 10),
  waitForConnections: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 10000,
  // Timezone handling
  timezone: '+00:00',
  dateStrings: false,
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  // Session timeout in milliseconds
  sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
} as const;

// Email Configuration
export const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Annadaan',
    email: process.env.SMTP_USER!,
  },
} as const;

// Application Configuration
export const APP_CONFIG = {
  name: 'Annadaan',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  apiVersion: 'v1',
  // Feature flags
  features: {
    emailNotifications: process.env.FEATURE_EMAIL_NOTIFICATIONS !== 'false',
    pdfReceipts: process.env.FEATURE_PDF_RECEIPTS !== 'false',
    imageCompression: process.env.FEATURE_IMAGE_COMPRESSION !== 'false',
  },
} as const;

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedDocumentTypes: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  imageQuality: parseFloat(process.env.IMAGE_QUALITY || '0.8'),
  maxImageWidth: parseInt(process.env.MAX_IMAGE_WIDTH || '1920', 10),
  maxImageHeight: parseInt(process.env.MAX_IMAGE_HEIGHT || '1080', 10),
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  // Specific limits for different endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 login attempts
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20, // 20 uploads
  },
} as const;

// Donation Configuration
export const DONATION_CONFIG = {
  upiId: process.env.UPI_ID || 'annadaan@paytm',
  upiName: process.env.UPI_NAME || 'Annadaan Foundation',
  minDonationAmount: parseFloat(process.env.MIN_DONATION_AMOUNT || '1'),
  maxDonationAmount: parseFloat(process.env.MAX_DONATION_AMOUNT || '100000'),
  transactionIdPrefix: {
    upi: 'UPI',
    item: 'ITEM',
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  phone: {
    regex: /^[6-9]\d{9}$/,
    length: 10,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  name: {
    minLength: 2,
    maxLength: 100,
    regex: /^[a-zA-Z\s'-]+$/,
  },
  address: {
    minLength: 10,
    maxLength: 500,
  },
  pincode: {
    regex: /^\d{6}$/,
    length: 6,
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required. Please log in.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  INVALID_INPUT: 'Invalid input data. Please check your request.',
  SERVER_ERROR: 'An internal server error occurred. Please try again later.',
  DATABASE_ERROR: 'Database operation failed. Please try again.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  DUPLICATE_ENTRY: 'This entry already exists.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  EMAIL_SENT: 'Email sent successfully.',
  UPLOAD_SUCCESS: 'File uploaded successfully.',
} as const;

// Helper function to check if running in production
export const isProduction = (): boolean => {
  return APP_CONFIG.environment === 'production';
};

// Helper function to check if running in development
export const isDevelopment = (): boolean => {
  return APP_CONFIG.environment === 'development';
};

// Export type for environment validation
export type RequiredEnvVar = typeof requiredEnvVars[number];
