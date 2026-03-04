# Environment Variables Documentation

This document describes all environment variables required and optional for the WebVitals.io Backend API.

## Required Variables

These variables MUST be set for the API to start successfully.

### Server Configuration

#### `NODE_ENV`
- **Description**: Application environment
- **Type**: String
- **Valid Values**: `development`, `production`, `test`
- **Default**: None (required)
- **Example**: `NODE_ENV=development`
- **Notes**: 
  - In `development`: Detailed error messages, debug logging, stack traces in responses
  - In `production`: Generic error messages, info logging, no stack traces
  - In `test`: Used for running tests with test database

#### `PORT`
- **Description**: Port number for the API server to listen on
- **Type**: Number
- **Valid Values**: 1-65535
- **Default**: None (required)
- **Example**: `PORT=4000`
- **Notes**: Must not conflict with other services (frontend uses 3000)

### Database Configuration

#### `DATABASE_URL`
- **Description**: PostgreSQL database connection string
- **Type**: String (PostgreSQL connection URL)
- **Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Default**: None (required)
- **Example**: `DATABASE_URL=postgresql://postgres:password@localhost:5432/webvitals`
- **Notes**: 
  - Used for development and production
  - Must have proper permissions for migrations
  - Connection pooling managed by Prisma (default: 10 connections)

#### `TEST_DATABASE_URL`
- **Description**: PostgreSQL database connection string for tests
- **Type**: String (PostgreSQL connection URL)
- **Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Default**: None (required for tests)
- **Example**: `TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/webvitals_test`
- **Notes**: 
  - Separate database to avoid affecting development data
  - Reset before each test suite
  - Should use same PostgreSQL version as production

### Authentication Configuration

#### `JWT_SECRET`
- **Description**: Secret key for signing JWT tokens
- **Type**: String
- **Minimum Length**: 32 characters recommended
- **Default**: None (required)
- **Example**: `JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars`
- **Security Notes**:
  - MUST be changed in production
  - Should be cryptographically random
  - Never commit to version control
  - Rotate periodically in production
  - Use environment-specific secrets (different for dev/staging/prod)

#### `JWT_EXPIRES_IN`
- **Description**: JWT token expiration time
- **Type**: String (Zeit/ms format)
- **Valid Values**: `7d`, `24h`, `60m`, `3600s`, etc.
- **Default**: None (required)
- **Example**: `JWT_EXPIRES_IN=7d`
- **Notes**: 
  - Shorter expiration = more secure but less convenient
  - Longer expiration = more convenient but less secure
  - Recommended: 7 days for development, 1-2 days for production

### CORS Configuration

#### `FRONTEND_URL`
- **Description**: Frontend application URL for CORS configuration
- **Type**: String (URL)
- **Format**: `http[s]://[host]:[port]` or `http[s]://[domain]`
- **Default**: None (required)
- **Example**: 
  - Development: `FRONTEND_URL=http://localhost:3000`
  - Production: `FRONTEND_URL=https://app.webvitals.io`
- **Notes**: 
  - Must match exact origin of frontend requests
  - Include protocol (http/https)
  - Include port if non-standard
  - No trailing slash

## Optional Variables

These variables have defaults but can be customized.

### Logging Configuration

#### `LOG_LEVEL`
- **Description**: Minimum log level to output
- **Type**: String
- **Valid Values**: `error`, `warn`, `info`, `debug`
- **Default**: `info` (production), `debug` (development)
- **Example**: `LOG_LEVEL=debug`
- **Notes**: 
  - `error`: Only errors
  - `warn`: Warnings and errors
  - `info`: General information, warnings, and errors
  - `debug`: All logs including debug information

#### `LOG_FILE_PATH`
- **Description**: Path to log file for production logging
- **Type**: String (file path)
- **Default**: `./logs/app.log`
- **Example**: `LOG_FILE_PATH=/var/log/webvitals/app.log`
- **Notes**: 
  - Only used in production
  - Directory must exist and be writable
  - Logs rotate daily
  - Maximum 14 days retention

## Environment-Specific Examples

### Development (.env)

```bash
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webvitals_dev
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webvitals_test

# Authentication
JWT_SECRET=dev-secret-key-change-in-production-12345
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log
```

### Production (.env.production)

```bash
# Server
NODE_ENV=production
PORT=4000

# Database (use environment-specific credentials)
DATABASE_URL=postgresql://prod_user:secure_password@db.example.com:5432/webvitals_prod

# Authentication (use strong, random secrets)
JWT_SECRET=<generate-strong-random-secret-min-32-chars>
JWT_EXPIRES_IN=2d

# CORS (use actual production domain)
FRONTEND_URL=https://app.webvitals.io

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=/var/log/webvitals/app.log
```

### Test (.env.test)

```bash
# Server
NODE_ENV=test
PORT=4001

# Database (separate test database)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webvitals_test
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/webvitals_test

# Authentication (can use simple values for tests)
JWT_SECRET=test-secret-key-for-testing-only
JWT_EXPIRES_IN=1h

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=error
```

## Validation

The API validates all required environment variables on startup. If any required variable is missing or invalid, the server will fail to start with a clear error message.

### Validation Rules

1. **NODE_ENV**: Must be one of `development`, `production`, `test`
2. **PORT**: Must be a valid port number (1-65535)
3. **DATABASE_URL**: Must be a valid PostgreSQL connection string
4. **JWT_SECRET**: Must be at least 32 characters in production
5. **JWT_EXPIRES_IN**: Must be a valid Zeit/ms format string
6. **FRONTEND_URL**: Must be a valid URL with protocol

### Validation Example

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().min(1).max(65535),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().regex(/^\d+[smhd]$/),
  FRONTEND_URL: z.string().url(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  LOG_FILE_PATH: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

## Security Best Practices

### 1. Never Commit Secrets
- Add `.env` to `.gitignore`
- Use `.env.example` as a template (without actual values)
- Document required variables without exposing secrets

### 2. Use Strong Secrets
- Generate JWT_SECRET using cryptographically secure random generator:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- Minimum 32 characters for JWT_SECRET
- Use different secrets for each environment

### 3. Rotate Secrets Regularly
- Change JWT_SECRET periodically in production
- Update database credentials on schedule
- Invalidate old tokens after rotation

### 4. Environment-Specific Configuration
- Use different secrets for dev/staging/prod
- Never use development secrets in production
- Test with production-like configuration in staging

### 5. Access Control
- Limit who can access production environment variables
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Audit access to secrets

## Troubleshooting

### Server Won't Start

**Error**: `Missing required environment variable: JWT_SECRET`
- **Solution**: Ensure all required variables are set in `.env` file
- **Check**: Run `cat .env` to verify file exists and contains all variables

**Error**: `Invalid DATABASE_URL format`
- **Solution**: Verify PostgreSQL connection string format
- **Check**: Test connection with `psql $DATABASE_URL`

### CORS Errors in Browser

**Error**: `Access-Control-Allow-Origin header missing`
- **Solution**: Verify `FRONTEND_URL` matches exact origin of frontend
- **Check**: Include protocol and port, no trailing slash
- **Example**: `http://localhost:3000` not `localhost:3000` or `http://localhost:3000/`

### JWT Token Issues

**Error**: `Invalid token signature`
- **Solution**: Ensure `JWT_SECRET` is consistent across restarts
- **Check**: Don't change JWT_SECRET while tokens are still valid
- **Note**: Changing JWT_SECRET invalidates all existing tokens

### Database Connection Issues

**Error**: `Can't reach database server`
- **Solution**: Verify PostgreSQL is running and accessible
- **Check**: Test with `psql $DATABASE_URL`
- **Firewall**: Ensure port 5432 is open if using remote database

## Additional Resources

- [Prisma Environment Variables](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Environment Variables](https://nodejs.org/api/process.html#process_process_env)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

## Support

For issues or questions about environment configuration:
1. Check this documentation
2. Review `.env.example` for template
3. Check API logs for specific error messages
4. Verify all required variables are set
5. Test database connectivity separately
