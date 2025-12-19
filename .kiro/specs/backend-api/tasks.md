# Implementation Plan - Backend API (Week 3)

This plan breaks down the backend API development into actionable tasks. Each task builds incrementally toward a production-ready API.

## Task Execution Guidelines

- Execute tasks in order
- Test after each milestone
- All tasks required unless marked with *
- Reference `docs/WEEK3_INTEGRATION.md` for detailed specs

---

## Current Status

✅ Basic Express server with health check endpoint exists
✅ TypeScript configuration in place
✅ Basic package.json with dev scripts

**Next Steps:** Complete project setup, add database, implement authentication, and build all API endpoints.

---

## Milestone 1: Project Setup & Configuration

- [x] 1. Complete project dependencies installation
  - Install dotenv for environment variables
  - Install cors for cross-origin requests
  - Install morgan for HTTP logging
  - Install express-rate-limit for rate limiting
  - Update port to 4000 (currently 3001)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 21.1-21.5_

- [x] 1.1 Create environment configuration
  - Create .env.example with all required variables (NODE_ENV, PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL)
  - Create .env file for development
  - Install and configure dotenv
  - Add environment validation on startup
  - _Requirements: 27.1, 27.4, 27.5_

- [x] 1.2 Set up middleware pipeline
  - Configure CORS for frontend origin (http://localhost:3000)
  - Add body parser middleware (express.json())
  - Add morgan HTTP request logging
  - Configure different log formats for dev/prod
  - _Requirements: 21.1-21.5, 23.1, 23.2_

---

## Milestone 2: Database Setup with Prisma

- [ ] 2. Initialize Prisma ORM
  - Install prisma and @prisma/client
  - Run `npx prisma init`
  - Configure DATABASE_URL in .env
  - Create Prisma schema matching WEEK3_INTEGRATION.md spec
  - Add User, Site, Metric, Alert models with relationships
  - _Requirements: 2.1, 2.2_

- [ ] 2.1 Create initial database migration
  - Run `npx prisma migrate dev --name init`
  - Verify all tables created with proper relationships
  - Verify indexes on email, siteId, userId, timestamp
  - Test: Database schema matches design document
  - _Requirements: 2.3, 28.1, 28.2_

- [ ] 2.2 Create Prisma client singleton
  - Create src/lib/prisma.ts with singleton pattern
  - Export prisma client for use across services
  - Add connection error handling
  - Test: Can query database successfully
  - _Requirements: 2.4, 25.1_

- [ ] 2.3 Create database seed script
  - Create prisma/seed.ts with test users and sites
  - Add seed script to package.json
  - Include sample metrics and alerts
  - Run `npx prisma db seed`
  - _Requirements: 2.5_

---

## Milestone 3: Authentication System

- [ ] 3. Implement password hashing utilities
  - Install bcrypt and @types/bcrypt
  - Create src/utils/password.ts with hash and compare functions
  - Use 10 salt rounds for bcrypt
  - Test: Password hashing and comparison works
  - _Requirements: 20.1, 20.2_

- [ ]* 3.1 Write property test for password hashing
  - **Property 1: Password Hashing**
  - For any password, it should be hashed before storage and never returned in responses
  - **Validates: Requirements 20.1, 20.3**

- [ ] 3.2 Implement JWT utilities
  - Install jsonwebtoken and @types/jsonwebtoken
  - Create src/utils/jwt.ts with sign and verify functions
  - Include userId and email in token payload
  - Set 7-day expiration from environment variable
  - Test: Token generation and verification works
  - _Requirements: 5.1, 5.2_

- [ ]* 3.3 Write property test for JWT validation
  - **Property 2: JWT Token Validation**
  - For any protected endpoint request, a valid JWT token should be required
  - **Validates: Requirements 5.3**

- [ ] 3.4 Create authentication middleware
  - Create src/middleware/auth.ts
  - Extract token from Authorization header (Bearer format)
  - Verify JWT token and attach user to request
  - Return 401 for missing/invalid/expired tokens
  - Test: Protected routes require valid token
  - _Requirements: 5.3, 5.4, 5.5_

- [ ] 3.5 Implement user registration
  - Create src/controllers/authController.ts
  - Create src/services/authService.ts
  - Implement POST /api/auth/register endpoint
  - Validate email format and password length (min 8 chars)
  - Hash password before storing
  - Return 409 if email already exists
  - Return JWT token and user object (without password)
  - _Requirements: 3.1-3.5_

- [ ]* 3.6 Write property test for duplicate email prevention
  - **Property 19: Duplicate Email Prevention**
  - For any registration with existing email, system should return 409
  - **Validates: Requirements 3.3**

- [ ] 3.7 Implement user login
  - Implement POST /api/auth/login endpoint
  - Validate email and password provided
  - Compare password hash with bcrypt
  - Return 401 for invalid credentials
  - Generate and return JWT token with user object
  - _Requirements: 4.1-4.5_

- [ ] 3.8 Implement get current user endpoint
  - Implement GET /api/auth/me endpoint
  - Require authentication middleware
  - Return current user from token (without password)
  - Test: Returns authenticated user details
  - _Requirements: 5.3_

- [ ]* 3.9 Write property test for password exclusion
  - **Property 18: Password Exclusion from Responses**
  - For any user object in API response, password hash should never be included
  - **Validates: Requirements 20.3**

---

## Milestone 4: Input Validation with Zod

- [ ] 4. Set up Zod validation infrastructure
  - Install zod
  - Create src/middleware/validate.ts for validation middleware
  - Create validation error formatter
  - Return 400 with field-specific errors on validation failure
  - _Requirements: 18.1-18.5_

- [ ]* 4.1 Write property test for input validation
  - **Property 4: Input Validation**
  - For any API request with body, input should be validated against schemas
  - **Validates: Requirements 18.1**

- [ ] 4.2 Create authentication validation schemas
  - Create src/validators/authValidators.ts
  - Define registerSchema (email, password, firstName, lastName)
  - Define loginSchema (email, password)
  - Email must be valid format, password min 8 characters
  - _Requirements: 3.1, 3.2, 4.1_

- [ ] 4.3 Create site validation schemas
  - Create src/validators/siteValidators.ts
  - Define createSiteSchema (name 3-50 chars, url format)
  - Define updateSiteSchema (name, url, isActive optional)
  - Validate URL format with Zod
  - _Requirements: 6.2, 6.3, 9.3_

- [ ] 4.4 Create metric validation schemas
  - Create src/validators/metricValidators.ts
  - Define metricSchema for submission
  - Validate numeric values for lcp, fid, cls, ttfb, fcp, tti
  - Validate deviceType, browserName, osName strings
  - _Requirements: 11.3_

- [ ] 4.5 Create alert validation schemas
  - Create src/validators/alertValidators.ts
  - Define createAlertSchema (metricType, threshold, condition)
  - Define updateAlertSchema (threshold, condition, isActive optional)
  - Validate metricType enum (lcp, fid, cls)
  - Validate condition enum (greater_than, less_than)
  - _Requirements: 14.3, 14.4, 14.5_

- [ ]* 4.6 Write property test for validation error details
  - **Property 23: Validation Error Field Details**
  - For any validation error, response should include specific invalid fields
  - **Validates: Requirements 18.3**

---

## Milestone 5: Site Management Endpoints

- [ ] 5. Implement create site endpoint
  - Create src/controllers/siteController.ts
  - Create src/services/siteService.ts
  - Implement POST /api/sites with authentication
  - Generate unique siteId (UUID or nanoid)
  - Extract domain from URL
  - Validate and sanitize inputs
  - Return created site object
  - _Requirements: 6.1-6.5_

- [ ] 5.1 Implement list sites endpoint
  - Implement GET /api/sites with authentication
  - Filter sites by authenticated user's ID
  - Order by createdAt descending
  - Return empty array if no sites
  - Include all site properties
  - _Requirements: 7.1-7.5_

- [ ]* 5.2 Write property test for empty array response
  - **Property 22: Empty Array for No Results**
  - For any list operation with no results, system should return empty array
  - **Validates: Requirements 7.4, 15.4**

- [ ] 5.3 Implement get site details endpoint
  - Implement GET /api/sites/:siteId with authentication
  - Verify user owns the site
  - Return 404 if site not found
  - Return 403 if user doesn't own site
  - Return all site properties
  - _Requirements: 8.1-8.5_

- [ ]* 5.4 Write property test for ownership verification
  - **Property 3: User Ownership Verification**
  - For any site/alert operation, system should verify authenticated user owns resource
  - **Validates: Requirements 8.2, 9.2, 10.2, 16.2, 17.2**

- [ ]* 5.5 Write property test for site ownership errors
  - **Property 20: Site Ownership Verification**
  - For any site operation, if user doesn't own site, return 403
  - **Validates: Requirements 8.4, 9.2, 10.2**

- [ ] 5.6 Implement update site endpoint
  - Implement PUT /api/sites/:siteId with authentication
  - Verify user owns the site
  - Allow updating name, url, isActive
  - Validate updated fields
  - Return updated site object
  - _Requirements: 9.1-9.5_

- [ ] 5.7 Implement delete site endpoint
  - Implement DELETE /api/sites/:siteId with authentication
  - Verify user owns the site
  - Delete site with cascade to metrics and alerts
  - Return success message
  - _Requirements: 10.1-10.5_

- [ ]* 5.8 Write property test for cascade deletion
  - **Property 7: Site Deletion Cascade**
  - For any site deletion, all associated metrics and alerts should be deleted
  - **Validates: Requirements 10.3, 10.4**

---

## Milestone 6: Metrics Collection & Retrieval

- [ ] 6. Implement submit metric endpoint
  - Create src/controllers/metricController.ts
  - Create src/services/metricService.ts
  - Implement POST /api/metrics (public endpoint)
  - Authenticate using X-Site-ID header
  - Validate siteId exists in database
  - Store metric with timestamp
  - Return success response immediately
  - _Requirements: 11.1-11.5_

- [ ] 6.1 Implement get metrics endpoint with filters
  - Implement GET /api/metrics/:siteId with authentication
  - Verify user owns the site
  - Support timeRange query param (24h, 7d, 30d)
  - Support deviceType query param filter
  - Support browserName query param filter
  - Return filtered metrics array
  - _Requirements: 12.1-12.5_

- [ ] 6.2 Implement metrics summary calculation
  - Create summary calculation utility
  - Calculate average for lcp, fid, cls
  - Calculate 95th percentile for lcp, fid, cls
  - Include total count of metrics
  - Return zero values when no metrics exist
  - Apply calculations only to filtered data
  - _Requirements: 13.1-13.5_

- [ ]* 6.3 Write property test for summary calculation
  - **Property 6: Metric Summary Calculation**
  - For any metrics retrieval, summary stats should be calculated from filtered dataset
  - **Validates: Requirements 13.1, 13.2**

- [ ] 6.4 Implement get metrics summary endpoint
  - Implement GET /api/metrics/:siteId/summary with authentication
  - Verify user owns the site
  - Support timeRange query param
  - Return summary statistics only
  - _Requirements: 13.1-13.5_

---

## Milestone 7: Alert Management Endpoints

- [ ] 7. Implement create alert endpoint
  - Create src/controllers/alertController.ts
  - Create src/services/alertService.ts
  - Implement POST /api/alerts with authentication
  - Verify user owns the site
  - Validate metricType, threshold, condition
  - Create alert with isActive=true by default
  - Return created alert object
  - _Requirements: 14.1-14.5_

- [ ] 7.1 Implement list alerts endpoint
  - Implement GET /api/alerts with authentication
  - Filter alerts by authenticated user's ID
  - Order by createdAt descending
  - Return empty array if no alerts
  - Include all alert properties
  - _Requirements: 15.1-15.5_

- [ ] 7.2 Implement update alert endpoint
  - Implement PUT /api/alerts/:alertId with authentication
  - Verify user owns the alert
  - Allow updating threshold, condition, isActive
  - Validate updated fields
  - Return updated alert object
  - _Requirements: 16.1-16.5_

- [ ] 7.3 Implement delete alert endpoint
  - Implement DELETE /api/alerts/:alertId with authentication
  - Verify user owns the alert
  - Return 404 if alert not found
  - Delete alert from database
  - Return success message
  - _Requirements: 17.1-17.5_

- [ ]* 7.4 Write property test for alert ownership
  - **Property 21: Alert Ownership Verification**
  - For any alert operation, if user doesn't own alert, return 403
  - **Validates: Requirements 16.2, 17.2**

---

## Milestone 8: Error Handling & Security

- [ ] 8. Create global error handler middleware
  - Create src/middleware/errorHandler.ts
  - Handle validation errors (400)
  - Handle authentication errors (401)
  - Handle authorization errors (403)
  - Handle not found errors (404)
  - Handle conflict errors (409)
  - Handle unexpected errors (500)
  - Return consistent JSON error format
  - Log errors with stack traces
  - Hide internal details in production
  - _Requirements: 19.1-19.5_

- [ ]* 8.1 Write property test for error response format
  - **Property 5: Error Response Format**
  - For any error, API should return JSON with message and appropriate status code
  - **Validates: Requirements 19.1, 19.2**

- [ ]* 8.2 Write property test for production error sanitization
  - **Property 24: Production Error Sanitization**
  - For any unexpected error in production, return 500 without internal details
  - **Validates: Requirements 19.5, 27.3**

- [ ] 8.3 Implement rate limiting
  - Install express-rate-limit
  - Configure 100 requests per 15 minutes per IP
  - Apply to all routes except /api/health
  - Return 429 when limit exceeded
  - Include Retry-After header in response
  - _Requirements: 22.1-22.5_

- [ ]* 8.4 Write property test for rate limit enforcement
  - **Property 8: Rate Limit Enforcement**
  - For any IP exceeding 100 requests per 15 minutes, return 429
  - **Validates: Requirements 22.2, 22.3**

- [ ]* 8.5 Write property test for Retry-After header
  - **Property 9: Retry-After Header on Rate Limit**
  - For any rate limit exceeded request, response should include Retry-After header
  - **Validates: Requirements 22.4**

- [ ] 8.6 Configure request logging
  - Configure morgan for HTTP logging
  - Use 'dev' format for development
  - Use 'combined' format for production
  - Log method, path, status, duration, timestamp
  - Exclude /api/health from logs
  - _Requirements: 23.1, 23.2_

- [ ]* 8.7 Write property test for request logging
  - **Property 16: Request Logging**
  - For any HTTP request, system should log method, path, and timestamp
  - **Validates: Requirements 23.1**

- [ ]* 8.8 Write property test for error logging
  - **Property 17: Error Logging with Stack Trace**
  - For any error, system should log error message and stack trace
  - **Validates: Requirements 19.3, 23.3**

---

## Milestone 9: Health Check & Database Management

- [ ] 9. Enhance health check endpoint
  - Update GET /api/health endpoint
  - Check database connectivity with Prisma
  - Return 200 with status, uptime, version if healthy
  - Return 503 if database unreachable
  - Exclude from authentication and rate limiting
  - _Requirements: 24.1-24.5_

- [ ]* 9.1 Write property test for health check database verification
  - **Property 10: Health Check Database Verification**
  - For any health check, if database unreachable, return 503
  - **Validates: Requirements 24.2, 24.3**

- [ ] 9.2 Implement database connection management
  - Configure Prisma connection pool
  - Add graceful shutdown on SIGTERM/SIGINT
  - Close all connections on shutdown
  - Add connection retry logic (3 attempts with exponential backoff)
  - Log database errors with context
  - _Requirements: 25.1-25.5_

- [ ]* 9.3 Write property test for database retry
  - **Property 11: Database Connection Retry**
  - For any failed database query, retry up to 3 times with exponential backoff
  - **Validates: Requirements 25.3**

---

## Milestone 10: API Response Standards

- [ ] 10. Implement consistent response formatting
  - Create src/utils/response.ts with response helpers
  - Ensure successful responses use 200 or 201 status codes
  - Wrap data in consistent JSON structure
  - Format all timestamps in ISO 8601 format
  - Add pagination support (page, limit, total) for list endpoints
  - _Requirements: 26.1-26.5_

- [ ]* 10.1 Write property test for response status codes
  - **Property 12: Consistent Response Format**
  - For any successful API response, status code should be 200 or 201
  - **Validates: Requirements 26.1**

- [ ]* 10.2 Write property test for timestamp format
  - **Property 13: ISO 8601 Timestamp Format**
  - For any response with timestamps, they should be in ISO 8601 format
  - **Validates: Requirements 26.5**

---

## Milestone 11: Environment & Configuration

- [ ] 11. Implement environment validation
  - Create src/config/env.ts for environment validation
  - Validate all required variables on startup
  - Fail fast with clear error messages if misconfigured
  - Support different configs for dev/test/prod
  - Load configuration from .env file
  - _Requirements: 27.1-27.5_

- [ ]* 11.1 Write property test for environment validation
  - **Property 14: Environment Variable Validation**
  - For any server startup, if required variables missing, fail with clear error
  - **Validates: Requirements 27.4, 27.5**

---

## Milestone 12: Database Migrations

- [ ] 12. Document migration workflow
  - Create migration documentation in README
  - Document how to create new migrations
  - Document how to apply migrations
  - Document rollback procedures
  - Test migration failure handling
  - _Requirements: 28.1-28.5_

- [ ]* 12.1 Write property test for migration rollback
  - **Property 15: Migration Rollback on Failure**
  - For any failed migration, system should rollback transaction
  - **Validates: Requirements 28.3**

---

## Milestone 13: Testing Infrastructure

- [ ] 13. Set up Jest testing framework
  - Install jest, @types/jest, ts-jest, supertest
  - Create jest.config.js for TypeScript
  - Configure test database (TEST_DATABASE_URL)
  - Create test utilities and factories
  - Add test scripts to package.json (test, test:watch, test:coverage)
  - _Requirements: 30.1-30.5_

- [ ]* 13.1 Write unit tests for authentication service
  - Test password hashing and comparison
  - Test JWT generation and verification
  - Test login validation logic
  - Test registration logic
  - Test duplicate email handling
  - _Requirements: 3.1-3.5, 4.1-4.5_

- [ ]* 13.2 Write integration tests for auth endpoints
  - Test POST /api/auth/register
  - Test POST /api/auth/login
  - Test GET /api/auth/me
  - Test invalid credentials
  - Test expired tokens
  - _Requirements: 3.1-5.5_

- [ ]* 13.3 Write integration tests for site endpoints
  - Test GET /api/sites
  - Test POST /api/sites
  - Test GET /api/sites/:siteId
  - Test PUT /api/sites/:siteId
  - Test DELETE /api/sites/:siteId
  - Test ownership verification
  - _Requirements: 6.1-10.5_

- [ ]* 13.4 Write integration tests for metrics endpoints
  - Test POST /api/metrics
  - Test GET /api/metrics/:siteId
  - Test filtering by timeRange, deviceType, browser
  - Test summary calculation
  - _Requirements: 11.1-13.5_

- [ ]* 13.5 Write integration tests for alert endpoints
  - Test GET /api/alerts
  - Test POST /api/alerts
  - Test PUT /api/alerts/:alertId
  - Test DELETE /api/alerts/:alertId
  - Test ownership verification
  - _Requirements: 14.1-17.5_

---

## Milestone 14: API Documentation

- [ ] 14. Create API documentation
  - Install swagger-jsdoc and swagger-ui-express
  - Create OpenAPI 3.0 specification
  - Document all endpoints with examples
  - Include request/response schemas
  - Document authentication requirements
  - Document error codes
  - Serve documentation at /api/docs
  - _Requirements: 29.1-29.5_

---

## Milestone 15: Frontend Integration

- [ ] 15. Prepare for frontend integration
  - Update CORS configuration for frontend URL
  - Verify all endpoints match frontend expectations
  - Test with frontend API client
  - Create integration testing guide
  - Document environment variables needed
  - _Requirements: Integration_

- [ ] 15.1 Create React Query integration hooks
  - Create example hooks for frontend team
  - Document authentication flow
  - Document error handling patterns
  - Provide TypeScript types for all responses
  - _Requirements: Integration_

- [ ]* 15.2 End-to-end integration testing
  - Test register → login → create site flow
  - Test site management CRUD operations
  - Test metrics submission and retrieval
  - Test alert management
  - Test error scenarios (401, 403, 404, 429)
  - _Requirements: All_

---

## Summary

**15 Milestones, 70+ Tasks (including 25 optional property-based tests)**

**Current Progress:**
- ✅ Basic Express server running
- ✅ TypeScript configuration
- ⏳ Database setup needed
- ⏳ Authentication system needed
- ⏳ All API endpoints needed

**Key Deliverables:**
- Express.js API with TypeScript (strict mode)
- PostgreSQL database with Prisma ORM
- JWT-based authentication system
- Complete CRUD endpoints for sites, metrics, alerts
- Input validation with Zod
- Comprehensive error handling
- Rate limiting and security middleware
- Health check endpoint
- Property-based tests for correctness properties
- Integration tests for all endpoints
- API documentation with Swagger
- Frontend integration ready

**Next Steps After Completion:**
- Week 4: WebSocket server for real-time updates
- Week 4: Tracking SDK development
- Week 4: Docker containerization
- Week 4: AWS deployment setup
