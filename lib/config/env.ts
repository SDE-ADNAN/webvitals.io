/**
 * Environment Configuration
 * 
 * This module validates and exports environment variables with type safety.
 * It ensures all required environment variables are present and properly formatted.
 */

/**
 * Validates that a required environment variable is present
 * @throws Error if the variable is missing
 */
function getRequiredEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please check your .env.local file and ensure ${key} is defined.\n` +
      `See .env.example for reference.`
    );
  }
  
  return value;
}

/**
 * Gets an optional environment variable with a default value
 */
function getOptionalEnvVar(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Parses a boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Parses a number environment variable
 */
function getNumberEnvVar(key: string, defaultValue: number): number {
  const value = process.env[key];
  
  if (value === undefined || value === '') {
    return defaultValue;
  }
  
  const parsed = parseInt(value, 10);
  
  if (isNaN(parsed)) {
    console.warn(
      `Invalid number value for ${key}: "${value}". Using default: ${defaultValue}`
    );
    return defaultValue;
  }
  
  return parsed;
}

/**
 * Validates URL format
 */
function validateUrl(url: string, varName: string): string {
  try {
    // For WebSocket URLs, temporarily replace ws:// with http:// for validation
    const urlToValidate = url.startsWith('ws://') || url.startsWith('wss://')
      ? url.replace(/^ws/, 'http')
      : url;
    
    new URL(urlToValidate);
    return url;
  } catch (error) {
    throw new Error(
      `Invalid URL format for ${varName}: "${url}"\n` +
      `Please provide a valid URL (e.g., http://localhost:4000 or ws://localhost:4000)`
    );
  }
}

// =============================================================================
// Environment Configuration Object
// =============================================================================

export const env = {
  // Application
  nodeEnv: getOptionalEnvVar('NODE_ENV', 'development'),
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // Feature Flags
  useMockData: getBooleanEnvVar('NEXT_PUBLIC_USE_MOCK_DATA', true),
  
  // API Configuration
  apiUrl: validateUrl(
    getOptionalEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:4000/api'),
    'NEXT_PUBLIC_API_URL'
  ),
  wsUrl: validateUrl(
    getOptionalEnvVar('NEXT_PUBLIC_WS_URL', 'ws://localhost:4000'),
    'NEXT_PUBLIC_WS_URL'
  ),
  apiTimeout: getNumberEnvVar('NEXT_PUBLIC_API_TIMEOUT', 10000),
  
  // AWS Configuration (optional, for future use)
  aws: {
    accessKeyId: getOptionalEnvVar('AWS_ACCESS_KEY_ID', ''),
    secretAccessKey: getOptionalEnvVar('AWS_SECRET_ACCESS_KEY', ''),
    region: getOptionalEnvVar('AWS_REGION', 'us-east-1'),
    s3Bucket: getOptionalEnvVar('AWS_S3_BUCKET', ''),
    cloudfrontDomain: getOptionalEnvVar('AWS_CLOUDFRONT_DOMAIN', ''),
  },
  
  // Database Configuration (optional, for future backend integration)
  database: {
    url: getOptionalEnvVar('DATABASE_URL', ''),
  },
  
  // Redis Configuration (optional, for future backend integration)
  redis: {
    url: getOptionalEnvVar('REDIS_URL', ''),
  },
  
  // Authentication Configuration (optional, for future backend integration)
  auth: {
    jwtSecret: getOptionalEnvVar('JWT_SECRET', ''),
    jwtExpiresIn: getOptionalEnvVar('JWT_EXPIRES_IN', '7d'),
  },
  
  // Email Configuration (optional, for future backend integration)
  email: {
    smtpHost: getOptionalEnvVar('SMTP_HOST', ''),
    smtpPort: getNumberEnvVar('SMTP_PORT', 587),
    smtpUser: getOptionalEnvVar('SMTP_USER', ''),
    smtpPass: getOptionalEnvVar('SMTP_PASS', ''),
    smtpFrom: getOptionalEnvVar('SMTP_FROM', 'noreply@webvitals.io'),
  },
  
  // Monitoring & Analytics (optional)
  monitoring: {
    sentryDsn: getOptionalEnvVar('NEXT_PUBLIC_SENTRY_DSN', ''),
    gaTrackingId: getOptionalEnvVar('NEXT_PUBLIC_GA_TRACKING_ID', ''),
  },
} as const;

// =============================================================================
// Validation on Module Load
// =============================================================================

/**
 * Validates the environment configuration on module load
 * This ensures that any configuration errors are caught early
 */
function validateEnvironment(): void {
  const errors: string[] = [];
  
  // Validate API URL format
  if (!env.apiUrl.startsWith('http://') && !env.apiUrl.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_API_URL must start with http:// or https://');
  }
  
  // Validate WebSocket URL format
  if (!env.wsUrl.startsWith('ws://') && !env.wsUrl.startsWith('wss://')) {
    errors.push('NEXT_PUBLIC_WS_URL must start with ws:// or wss://');
  }
  
  // Validate API timeout is positive
  if (env.apiTimeout <= 0) {
    errors.push('NEXT_PUBLIC_API_TIMEOUT must be a positive number');
  }
  
  // Log warnings for optional configurations in production
  if (env.isProduction) {
    if (!env.monitoring.sentryDsn) {
      console.warn('⚠️  NEXT_PUBLIC_SENTRY_DSN is not set. Error monitoring is disabled.');
    }
    
    if (env.useMockData) {
      console.warn('⚠️  NEXT_PUBLIC_USE_MOCK_DATA is true in production. This should be false.');
    }
  }
  
  // Throw error if any validation failed
  if (errors.length > 0) {
    throw new Error(
      'Environment configuration validation failed:\n' +
      errors.map(err => `  - ${err}`).join('\n') +
      '\n\nPlease check your .env.local file and fix the issues above.'
    );
  }
}

// Run validation on module load (only in Node.js environment)
if (typeof window === 'undefined') {
  try {
    validateEnvironment();
    
    // Log configuration in development
    if (env.isDevelopment) {
      console.log('✅ Environment configuration loaded successfully');
      console.log('📝 Configuration:', {
        nodeEnv: env.nodeEnv,
        useMockData: env.useMockData,
        apiUrl: env.apiUrl,
        wsUrl: env.wsUrl,
      });
    }
  } catch (error) {
    console.error('❌ Environment configuration error:', error);
    throw error;
  }
}

// =============================================================================
// Type Exports
// =============================================================================

export type Environment = typeof env;
