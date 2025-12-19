import dotenv from "dotenv";

// Load environment variables
dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  TEST_DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  FRONTEND_URL: string;
  LOG_LEVEL: string;
  LOG_FILE_PATH: string;
}

/**
 * Validates that all required environment variables are present
 * Fails fast with clear error messages if misconfigured
 */
function validateEnv(): EnvConfig {
  const requiredVars = [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "FRONTEND_URL",
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        `Please check your .env file and ensure all required variables are set.`
    );
  }

  // Validate PORT is a valid number
  const port = parseInt(process.env.PORT!, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `Invalid PORT value: ${process.env.PORT}. Must be a number between 1 and 65535.`
    );
  }

  // Validate DATABASE_URL format
  if (!process.env.DATABASE_URL!.startsWith("postgresql://")) {
    throw new Error(
      `Invalid DATABASE_URL format. Must start with "postgresql://"`
    );
  }

  // Validate JWT_SECRET is not the default example value
  if (
    process.env.JWT_SECRET === "your-secret-key-here-change-in-production"
  ) {
    console.warn(
      "WARNING: Using default JWT_SECRET. Please change this in production!"
    );
  }

  return {
    NODE_ENV: process.env.NODE_ENV!,
    PORT: port,
    DATABASE_URL: process.env.DATABASE_URL!,
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL!,
    JWT_SECRET: process.env.JWT_SECRET!,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN!,
    FRONTEND_URL: process.env.FRONTEND_URL!,
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
    LOG_FILE_PATH: process.env.LOG_FILE_PATH || "./logs/app.log",
  };
}

// Validate environment on module load
export const env = validateEnv();

// Export for testing
export { validateEnv };
