# Design Document - Backend API (Week 3)

## Overview

Backend API for WebVitals.io built with Node.js 20, Express.js 4.x, TypeScript 5.x, Prisma ORM, and PostgreSQL. Provides RESTful endpoints for authentication, site management, metrics collection, and alerts.

**Key Principles:** Layered architecture, type-safety, JWT auth, input validation, comprehensive error handling.

## Architecture

**Layered Architecture Pattern:**

```
HTTP Request
    ↓
Middleware Layer (CORS, Body Parser, Rate Limiting, Auth, Logging)
    ↓
Controller Layer (Route handlers, request/response formatting)
    ↓
Service Layer (Business logic, validation)
    ↓
Prisma ORM (Type-safe database access)
    ↓
PostgreSQL Database
```

**Design Rationale:** This layered approach separates concerns, making the codebase maintainable and testable. Controllers handle HTTP concerns, services contain business logic, and Prisma provides type-safe data access. This separation allows us to test business logic independently of HTTP infrastructure.

**Technology Stack:**
- **Runtime:** Node.js 20
- **Framework:** Express.js 4.x
- **Language:** TypeScript 5.x (strict mode)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Password Hashing:** bcrypt
- **Testing:** Jest + Supertest
- **Logging:** Morgan (HTTP) + Winston/Pino (application)

**Middleware Pipeline:**
1. CORS (cross-origin resource sharing)
2. Body Parser (JSON request parsing)
3. Morgan (HTTP request logging)
4. Rate Limiting (abuse prevention)
5. Authentication (JWT verification for protected routes)
6. Error Handler (centralized error processing)

## Components and Interfaces

### Controllers
Handle HTTP request/response cycle, input validation, and response formatting.

**Key Controllers:**
- `authController.ts` - Registration, login, logout, get current user
- `siteController.ts` - CRUD operations for sites
- `metricController.ts` - Metric submission and retrieval
- `alertController.ts` - CRUD operations for alerts
- `healthController.ts` - Health check endpoint

### Services
Contain business logic and orchestrate data access through Prisma.

**Key Services:**
- `authService.ts` - User authentication, password hashing, JWT generation
- `siteService.ts` - Site management, ownership verification
- `metricService.ts` - Metric storage, retrieval, summary calculations
- `alertService.ts` - Alert management, ownership verification

### Middleware
Process requests before they reach controllers.

**Key Middleware:**
- `auth.ts` - JWT token verification, user attachment to request
- `errorHandler.ts` - Centralized error handling and formatting
- `validate.ts` - Request validation using Zod schemas
- `rateLimiter.ts` - Rate limiting configuration

### Utilities
Shared helper functions.

**Key Utilities:**
- `jwt.ts` - Token generation and verification
- `logger.ts` - Application logging configuration
- `prisma.ts` - Prisma client singleton

## Data Models

### User Model
```typescript
{
  id: string (UUID)
  email: string (unique)
  password: string (bcrypt hashed)
  name: string (optional)
  createdAt: DateTime
  updatedAt: DateTime
  sites: Site[]
}
```

### Site Model
```typescript
{
  id: string (UUID)
  siteId: string (unique, for SDK tracking)
  name: string (3-50 chars)
  url: string (validated URL)
  domain: string (extracted from URL)
  isActive: boolean
  userId: string (foreign key)
  createdAt: DateTime
  updatedAt: DateTime
  user: User
  metrics: Metric[]
  alerts: Alert[]
}
```

### Metric Model
```typescript
{
  id: string (UUID)
  siteId: string (foreign key)
  lcp: number (Largest Contentful Paint in ms)
  fid: number (First Input Delay in ms)
  cls: number (Cumulative Layout Shift score)
  deviceType: string (desktop, mobile, tablet)
  browser: string (chrome, firefox, safari, etc.)
  timestamp: DateTime
  createdAt: DateTime
  site: Site
}
```

### Alert Model
```typescript
{
  id: string (UUID)
  siteId: string (foreign key)
  userId: string (foreign key)
  metricType: string (lcp, fid, cls)
  condition: string (greater_than, less_than)
  threshold: number
  isActive: boolean
  createdAt: DateTime
  updatedAt: DateTime
  site: Site
  user: User
}
```

**Relationships:**
- User → Sites (one-to-many)
- Site → Metrics (one-to-many, cascade delete)
- Site → Alerts (one-to-many, cascade delete)
- User → Alerts (one-to-many)

**Design Rationale:** The schema uses UUIDs for security (non-sequential IDs), includes timestamps for auditing, and uses cascade deletes to maintain referential integrity. The separate `siteId` field allows SDK tracking without exposing internal database IDs.

## API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user (returns JWT + user)
- `POST /api/auth/login` - Login user (returns JWT + user)

### Authentication (Protected)
- `POST /api/auth/logout` - Logout user (optional, client-side token removal)
- `GET /api/auth/me` - Get current user profile

### Sites (Protected)
- `GET /api/sites` - List user's sites (ordered by createdAt desc)
- `GET /api/sites/:siteId` - Get site details (ownership verified)
- `POST /api/sites` - Create site (generates unique siteId)
- `PUT /api/sites/:siteId` - Update site (ownership verified)
- `DELETE /api/sites/:siteId` - Delete site (cascade to metrics/alerts)

### Metrics
- `POST /api/metrics` - Submit metric (SDK auth via X-Site-ID header)
- `GET /api/metrics/:siteId` - Get metrics with filters (protected, ownership verified)
  - Query params: `timeRange` (24h, 7d, 30d), `deviceType`, `browser`
- `GET /api/metrics/:siteId/summary` - Get summary stats (avg, p95, count)

### Alerts (Protected)
- `GET /api/alerts` - List user's alerts (ordered by createdAt desc)
- `POST /api/alerts` - Create alert (ownership verified)
- `PUT /api/alerts/:alertId` - Update alert (ownership verified)
- `DELETE /api/alerts/:alertId` - Delete alert (ownership verified)

### Health (Public)
- `GET /api/health` - Health check (includes DB connectivity, uptime, version)

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system._

### Property 1: Password Hashing
_For any_ user registration or password update, the password should be hashed with bcrypt before storage
**Validates: Requirements 20.1**

### Property 2: JWT Token Validation
_For any_ protected endpoint request, a valid JWT token should be required in the Authorization header
**Validates: Requirements 5.3**

### Property 3: User Ownership Verification
_For any_ site or alert operation, the system should verify the authenticated user owns the resource
**Validates: Requirements 8.2, 9.2, 10.2, 16.2, 17.2**

### Property 4: Input Validation
_For any_ API request with a body, the input should be validated against defined schemas before processing
**Validates: Requirements 18.1**

### Property 5: Error Response Format
_For any_ error that occurs, the API should return a JSON response with error message and appropriate HTTP status code
**Validates: Requirements 19.1, 19.2**

### Property 6: Metric Summary Calculation
_For any_ metrics retrieval request, summary statistics (avg, p95) should be calculated from the filtered dataset
**Validates: Requirements 13.1, 13.2**

### Property 7: Site Deletion Cascade
_For any_ site deletion, all associated metrics and alerts should also be deleted
**Validates: Requirements 10.3, 10.4**

### Property 8: Rate Limit Enforcement
_For any_ IP address exceeding 100 requests per 15 minutes, subsequent requests should return 429 status
**Validates: Requirements 22.2, 22.3**

### Property 9: Retry-After Header on Rate Limit
_For any_ request that exceeds the rate limit, the response should include a Retry-After header
**Validates: Requirements 22.4**

### Property 10: Health Check Database Verification
_For any_ health check request, if the database is unreachable, the response should return 503 status
**Validates: Requirements 24.2, 24.3**

### Property 11: Database Connection Retry
_For any_ failed database query, the system should retry up to 3 times with exponential backoff before returning an error
**Validates: Requirements 25.3**

### Property 12: Consistent Response Format
_For any_ successful API response, the HTTP status code should be 200 or 201
**Validates: Requirements 26.1**

### Property 13: ISO 8601 Timestamp Format
_For any_ response containing timestamps, they should be formatted in ISO 8601 format
**Validates: Requirements 26.5**

### Property 14: Environment Variable Validation
_For any_ server startup, if required environment variables are missing, the server should fail to start with a clear error message
**Validates: Requirements 27.4, 27.5**

### Property 15: Migration Rollback on Failure
_For any_ database migration that fails, the system should rollback the transaction
**Validates: Requirements 28.3**

### Property 16: Request Logging
_For any_ HTTP request received, the system should log the method, path, and timestamp
**Validates: Requirements 23.1**

### Property 17: Error Logging with Stack Trace
_For any_ error that occurs, the system should log the error message and stack trace
**Validates: Requirements 19.3, 23.3**

### Property 18: Password Exclusion from Responses
_For any_ user object returned in an API response, the password hash should never be included
**Validates: Requirements 20.3**

### Property 19: Duplicate Email Prevention
_For any_ registration attempt with an existing email, the system should return a 409 Conflict error
**Validates: Requirements 3.3**

### Property 20: Site Ownership Verification
_For any_ site operation (get, update, delete), if the authenticated user does not own the site, the system should return a 403 Forbidden error
**Validates: Requirements 8.4, 9.2, 10.2**

### Property 21: Alert Ownership Verification
_For any_ alert operation (update, delete), if the authenticated user does not own the alert, the system should return a 403 Forbidden error
**Validates: Requirements 16.2, 17.2**

### Property 22: Empty Array for No Results
_For any_ list operation (sites, alerts) where no results exist, the system should return an empty array
**Validates: Requirements 7.4, 15.4**

### Property 23: Validation Error Field Details
_For any_ validation error, the response should include which specific fields are invalid
**Validates: Requirements 18.3**

### Property 24: Production Error Sanitization
_For any_ unexpected error in production, the response should return 500 without exposing internal details
**Validates: Requirements 19.5, 27.3**

## Testing Strategy

**Dual Testing Approach:**

The API will use both unit tests and property-based tests to ensure comprehensive coverage. Unit tests verify specific examples and edge cases, while property tests verify universal properties across all inputs.

### Unit Tests (Jest)
- **Controllers:** Test request/response handling, status codes, error cases
- **Services:** Test business logic, data transformations, edge cases
- **Utilities:** Test helper functions (JWT, password hashing, validation)
- **Middleware:** Test authentication, error handling, rate limiting

**Key Unit Test Areas:**
- Password hashing and comparison
- JWT generation and verification
- Input validation with specific invalid inputs
- Error response formatting
- Ownership verification logic
- Summary statistics calculation with known datasets

### Integration Tests (Jest + Supertest)
- **API Endpoints:** Test full request/response cycle with test database
- **Authentication Flow:** Register → Login → Protected endpoint access
- **CRUD Operations:** Create → Read → Update → Delete for all resources
- **Error Scenarios:** 401, 403, 404, 409, 429, 500 responses
- **Database Interactions:** Verify data persistence and cascade deletes

**Test Database Setup:**
- Separate test database (configured via TEST_DATABASE_URL)
- Database reset before each test suite
- Test data factories for creating users, sites, metrics, alerts
- Cleanup after each test to ensure isolation

### Property-Based Tests (fast-check)

Property-based tests will run a minimum of 100 iterations per test to verify correctness across random inputs.

**Each property-based test MUST:**
- Be tagged with a comment: `// Feature: backend-api, Property {number}: {property_text}`
- Reference the correctness property from the design document
- Implement exactly ONE correctness property per test

**Key Property Test Areas:**
- Password hashing: Any password should be hashed before storage
- JWT validation: Any protected endpoint should require valid token
- Ownership verification: Any resource operation should verify ownership
- Input validation: Any invalid input should be rejected with 400
- Error format: Any error should return consistent JSON structure
- Rate limiting: Any IP exceeding limit should get 429
- Timestamp format: Any timestamp should be ISO 8601

**Testing Library:** fast-check (property-based testing for TypeScript)

**Coverage Target:** 80%+ code coverage

**Test Execution:**
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:coverage` - Generate coverage report

## Error Handling

**Centralized Error Handler Middleware:**

All errors are caught by a global error handler that formats responses consistently and logs appropriately.

**Error Response Format:**
```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {} // Optional, only for validation errors
}
```

**HTTP Status Codes:**
- **400 Bad Request:** Validation errors, malformed requests
  - Includes field-specific error details
- **401 Unauthorized:** Missing or invalid authentication token
  - "Authentication required" or "Invalid token"
- **403 Forbidden:** Valid auth but insufficient permissions
  - "You do not have permission to access this resource"
- **404 Not Found:** Resource doesn't exist
  - "Site not found" or "Alert not found"
- **409 Conflict:** Duplicate resource (e.g., email already exists)
  - "Email already registered"
- **429 Too Many Requests:** Rate limit exceeded
  - Includes Retry-After header
- **500 Internal Server Error:** Unexpected errors
  - Generic message in production, detailed in development
  - Never exposes stack traces or internal details in production

**Logging Strategy:**
- All errors logged with stack traces for debugging
- Error context includes: user ID, request path, timestamp
- Production logs sanitized to exclude sensitive data
- Development logs include full error details

**Design Rationale:** Consistent error handling improves API usability and debugging. The centralized handler ensures all errors follow the same format, making client-side error handling predictable.

## Security

**Authentication & Authorization:**
- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- Token payload: userId, email (no sensitive data)
- JWT secret stored in environment variables
- Protected routes require valid JWT in Authorization header
- Ownership verification for all resource operations

**Input Validation:**
- All request bodies validated with Zod schemas
- Email format validation
- Password minimum length (8 characters)
- URL format validation
- Numeric value validation for metrics
- Enum validation for metric types and conditions

**API Security:**
- CORS configured for specific frontend origin
- Credentials (cookies, auth headers) allowed
- Allowed methods: GET, POST, PUT, DELETE
- Allowed headers: Content-Type, Authorization
- Rate limiting: 100 requests per 15 minutes per IP
- Health check endpoint excluded from rate limiting

**Database Security:**
- SQL injection prevention via Prisma parameterized queries
- Connection pooling with secure credentials
- Database credentials in environment variables
- Separate databases for development, test, production

**Response Security:**
- Password hashes never included in responses
- Internal error details hidden in production
- Stack traces only in development
- Sensitive data excluded from logs

**Design Rationale:** Defense in depth approach with multiple security layers. Bcrypt provides strong password hashing, JWT enables stateless authentication, and Zod ensures only valid data reaches the database.



## Performance

**Database Optimization:**
- Connection pooling (Prisma default: 10 connections)
- Indexed queries on frequently accessed fields:
  - User.email (unique index)
  - Site.siteId (unique index)
  - Site.userId (foreign key index)
  - Metric.siteId (foreign key index)
  - Metric.timestamp (for time-range queries)
  - Alert.userId (foreign key index)
- Query optimization for summary statistics (single query with aggregations)

**Connection Management:**
- Graceful shutdown: close all connections on SIGTERM/SIGINT
- Connection retry with exponential backoff (3 attempts)
- Connection pool exhaustion handling (queue requests)
- Database error logging with context

**Response Time Targets:**
- p50: < 100ms
- p95: < 200ms
- p99: < 500ms

**Scalability Considerations:**
- Stateless API design (JWT tokens, no server-side sessions)
- Horizontal scaling ready (no in-memory state)
- Database connection pooling supports multiple instances
- Rate limiting per IP (can be moved to API gateway)

**Monitoring:**
- Request duration logging
- Database query performance tracking
- Error rate monitoring
- Health check endpoint for uptime monitoring

**Design Rationale:** Connection pooling and indexed queries ensure fast response times. Stateless design allows horizontal scaling without session management complexity.

## Logging and Monitoring

**HTTP Request Logging (Morgan):**
- Development: `dev` format (colored, detailed)
- Production: `combined` format (Apache-style)
- Logs: method, path, status code, response time, timestamp
- Excluded: health check endpoint (to reduce noise)

**Application Logging (Winston/Pino):**
- Log levels: error, warn, info, debug
- Development: console output with colors, debug level
- Production: file output, info level, JSON format
- Error logs include: stack trace, user ID, request context

**Log Rotation (Production):**
- Daily log files
- Maximum 14 days retention
- Compressed archives for older logs
- Separate files for errors and general logs

**Monitoring Metrics:**
- Request count per endpoint
- Response time percentiles (p50, p95, p99)
- Error rate by status code
- Database query performance
- Active connections count
- Memory usage
- CPU usage

**Health Check Endpoint:**
- `GET /api/health`
- Returns: status, uptime, version, database connectivity
- Used by load balancers and monitoring tools
- No authentication required
- Excluded from rate limiting

**Design Rationale:** Comprehensive logging enables debugging and performance analysis. Structured logs in production facilitate log aggregation and analysis. Health checks enable automated monitoring and alerting.

## API Documentation

**Documentation Approach:**

API documentation will be served at `/api/docs` using Swagger/OpenAPI specification.

**Documentation Contents:**
- All endpoints with descriptions
- Request/response schemas with examples
- Authentication requirements per endpoint
- Error codes and their meanings
- Query parameter descriptions
- Request body validation rules

**Example Documentation Structure:**

```yaml
/api/auth/register:
  POST:
    summary: Register a new user
    tags: [Authentication]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              email: string (format: email)
              password: string (minLength: 8)
              name: string (optional)
    responses:
      201:
        description: User created successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                token: string
                user: object
      400:
        description: Validation error
      409:
        description: Email already exists
```

**Documentation Tools:**
- Swagger UI for interactive documentation
- OpenAPI 3.0 specification
- Auto-generated from code annotations (swagger-jsdoc)
- Kept in sync with implementation

**Design Rationale:** Interactive documentation improves developer experience and reduces integration time. OpenAPI standard ensures compatibility with API tools and clients.

## Environment Configuration

**Required Environment Variables:**

```bash
# Server
NODE_ENV=development|production
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/webvitals
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/webvitals_test

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info|debug|error
LOG_FILE_PATH=/var/log/webvitals/app.log
```

**Environment-Specific Behavior:**

**Development:**
- Detailed error messages with stack traces
- Debug-level logging to console
- CORS allows localhost origins
- Hot reload with nodemon
- Prisma Studio enabled

**Production:**
- Generic error messages (no stack traces)
- Info-level logging to files
- CORS restricted to specific origin
- Process manager (PM2)
- Prisma Studio disabled

**Validation on Startup:**
- Check all required variables are present
- Validate DATABASE_URL format
- Verify JWT_SECRET is set and secure
- Fail fast with clear error messages if misconfigured

**Design Rationale:** Environment-based configuration enables different behaviors for development and production without code changes. Validation on startup prevents runtime errors from misconfiguration.

## Database Migrations

**Migration Strategy (Prisma):**

Prisma manages all database schema changes through migrations, ensuring reproducibility and version control.

**Migration Workflow:**
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Prisma generates SQL migration file
4. Migration applied to development database
5. Commit migration file to version control
6. Apply to production: `npx prisma migrate deploy`

**Migration Features:**
- Automatic migration generation from schema changes
- SQL migration files for review and customization
- Migration history tracked in `_prisma_migrations` table
- Rollback support (manual via SQL)
- Transaction-based migrations (atomic)

**Migration Failure Handling:**
- Failed migrations rollback automatically
- Error logged with details
- Database remains in previous state
- Manual intervention required for resolution

**Initial Migration:**
- Creates User, Site, Metric, Alert tables
- Sets up relationships and foreign keys
- Creates indexes for performance
- Adds constraints (unique, not null)

**Design Rationale:** Prisma migrations provide type-safe schema management with automatic SQL generation. Version-controlled migrations ensure all environments have consistent schemas.

## Integration with Frontend

**Type Safety:**
- Frontend types in `packages/types/` match API responses exactly
- Shared types ensure consistency between frontend and backend
- TypeScript interfaces for User, Site, Metric, Alert

**API Client Configuration:**
- Base URL from environment variable
- Axios/Fetch for HTTP requests
- JWT token in Authorization header
- Error handling for all status codes

**Integration Points:**
- Authentication: Register, Login, Get Current User
- Sites: CRUD operations
- Metrics: Retrieval with filters, summary statistics
- Alerts: CRUD operations

**Mock Data Transition:**
- Environment variable: `NEXT_PUBLIC_USE_MOCK_DATA=false`
- React Query hooks updated to call real API
- Mock data preserved for development/testing

See `docs/WEEK3_INTEGRATION.md` for detailed integration guide.
