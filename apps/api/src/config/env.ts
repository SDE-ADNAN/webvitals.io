import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Environment configuration interface
 * Defines all required and optional environment variables
 */
interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  PORT: number;
  DATABASE_URL: string;
  TEST_DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  LOG_LEVEL: "debug" | "info" | "warn" | "error";
  LOG_FILE_PATH: string;
}

/**
 * Environment helper functions
 */
export const isDevelopment = () => process.env.NODE_ENV === "development";
export const isProduction = () => process.env.NODE_ENV === "production";
export const isTest = () => process.env.NODE_ENV === "test";

/**
 * Validates that all required environment variables are present and properly formatted
 * Fails fast with clear error messages if misconfigured
 * 
 * Requirements:
 * - 27.1: Load configuration from environment variables
 * - 27.4: Fail to start with clear error messages if misconfigured
 * - 27.5: Validate all required variables are present
 */
function validateEnv(): EnvConfig {
  const errors: string[] = [];

  // Required environment variables
  const requiredVars = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "FRONTEND_URL",
  ];

  // Check for missing required variables
  const missingVars: string[] = [];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    errors.push(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  // Validate NODE_ENV
  const validNodeEnvs = ["development", "production", "test"];
  if (
    process.env.NODE_ENV &&
    !validNodeEnvs.includes(process.env.NODE_ENV)
  ) {
    errors.push(
      `Invalid NODE_ENV value: "${process.env.NODE_ENV}". Must be one of: ${validNodeEnvs.join(", ")}`
    );
  }

  // Validate PORT is a valid number
  const port = parseInt(process.env.PORT || "", 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    errors.push(
      `Invalid PORT value: "${process.env.PORT}". Must be a number between 1 and 65535.`
    );
  }

  // Validate DATABASE_URL format
  if (
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.startsWith("postgresql://")
  ) {
    errors.push(
      `Invalid DATABASE_URL format. Must start with "postgresql://"`
    );
  }

  // Validate JWT_SECRET security
  if (process.env.JWT_SECRET) {
    // Check if using default/example value
    if (
      process.env.JWT_SECRET === "your-secret-key-here" ||
      process.env.JWT_SECRET === "your-secret-key-here-change-in-production"
    ) {
      if (process.env.NODE_ENV === "production") {
        errors.push(
          "JWT_SECRET is using the default example value. This is insecure for production!"
        );
      } else {
        console.warn(
          "⚠️  WARNING: Using default JWT_SECRET. Please change this before deploying to production!"
        );
      }
    }

    // Check minimum length for security
    if (process.env.JWT_SECRET.length < 32) {
      if (process.env.NODE_ENV === "production") {
        errors.push(
          "JWT_SECRET must be at least 32 characters long for production security."
        );
      } else {
        console.warn(
          "⚠️  WARNING: JWT_SECRET should be at least 32 characters long for better security."
        );
      }
    }
  }

  // Validate JWT_EXPIRES_IN format (e.g., "7d", "24h", "60m")
  if (process.env.JWT_EXPIRES_IN) {
    const expiresInPattern = /^\d+[smhd]$/;
    if (!expiresInPattern.test(process.env.JWT_EXPIRES_IN)) {
      errors.push(
        `Invalid JWT_EXPIRES_IN format: "${process.env.JWT_EXPIRES_IN}". Must be in format like "7d", "24h", "60m", "3600s".`
      );
    }
  }

  // Validate FRONTEND_URL format
  if (process.env.FRONTEND_URL) {
    try {
      new URL(process.env.FRONTEND_URL);
    } catch {
      errors.push(
        `Invalid FRONTEND_URL format: "${process.env.FRONTEND_URL}". Must be a valid URL.`
      );
    }
  }

  // Validate LOG_LEVEL if provided
  const validLogLevels = ["debug", "info", "warn", "error"];
  const logLevel = process.env.LOG_LEVEL || "info";
  if (!validLogLevels.includes(logLevel)) {
    errors.push(
      `Invalid LOG_LEVEL value: "${logLevel}". Must be one of: ${validLogLevels.join(", ")}`
    );
  }

  // If there are any validation errors, fail fast with clear message
  if (errors.length > 0) {
    const errorMessage = [
      "❌ Environment configuration validation failed:",
      "",
      ...errors.map((err) => `  • ${err}`),
      "",
      "Please check your .env file and ensure all required variables are properly set.",
      "See .env.example for reference.",
    ].join("\n");

    throw new Error(errorMessage);
  }

  // Environment-specific warnings
  if (process.env.NODE_ENV === "production") {
    console.log("🚀 Running in PRODUCTION mode");
    console.log("   - Stack traces disabled in error responses");
    console.log("   - Debug logging disabled");
    console.log("   - CORS restricted to:", process.env.FRONTEND_URL);
  } else if (process.env.NODE_ENV === "development") {
    console.log("🔧 Running in DEVELOPMENT mode");
    console.log("   - Detailed error messages enabled");
    console.log("   - Debug logging enabled");
    console.log("   - Hot reload available");
  } else if (process.env.NODE_ENV === "test") {
    console.log("🧪 Running in TEST mode");
  }

  // Return validated configuration
  return {
    NODE_ENV: process.env.NODE_ENV as "development" | "production" | "test",
    PORT: port,
    DATABASE_URL: process.env.DATABASE_URL!,
    TEST_DATABASE_URL:
      process.env.TEST_DATABASE_URL || process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    LOG_LEVEL: logLevel as "debug" | "info" | "warn" | "error",
    LOG_FILE_PATH: process.env.LOG_FILE_PATH || "./logs/app.log",
  };
}

/**
 * Validated environment configuration
 * This is validated on module load, so any configuration errors will prevent the server from starting
 */
export const env = validateEnv();

// Export for testing
export { validateEnv };
