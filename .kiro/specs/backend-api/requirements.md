# Requirements Document - Backend API (Week 3)

## Introduction

This specification covers Week 3 of WebVitals.io development, focusing on building the backend API that will power the frontend dashboard. The goal is to create a production-ready Node.js/Express API with PostgreSQL database, authentication, and all necessary endpoints to replace the mock data currently used in the frontend.

The backend API serves as the data layer for the WebVitals.io platform, handling user authentication, site management, metrics collection, and alert configuration. It must be secure, performant, and scalable to support real-time metric ingestion from multiple websites.

## Glossary

- **API Server**: The Express.js application that handles HTTP requests and responses
- **Database**: PostgreSQL database storing all application data
- **Prisma**: ORM (Object-Relational Mapping) tool for database access and migrations
- **JWT (JSON Web Token)**: Token-based authentication mechanism
- **Middleware**: Express functions that process requests before reaching route handlers
- **Controller**: Function that handles a specific API endpoint
- **Service**: Business logic layer that controllers call
- **Repository**: Data access layer that interacts with the database
- **Migration**: Database schema change tracked by Prisma
- **Seed Data**: Initial data inserted into the database for development/testing
- **Rate Limiting**: Mechanism to prevent API abuse by limiting request frequency
- **CORS (Cross-Origin Resource Sharing)**: Security feature allowing frontend to access API
- **Bcrypt**: Library for hashing passwords securely
- **Validation**: Process of checking request data against defined rules

## Requirements

### Requirement 1: Project Setup and Configuration

**User Story:** As a developer, I want a properly configured Express.js API project with TypeScript, so that I can build a type-safe and maintainable backend.

#### Acceptance Criteria

1. WHEN the project is initialized, THE API Server SHALL use Express.js 4.x with TypeScript 5.x
2. WHEN the server starts, THE API Server SHALL listen on port 4000 by default
3. WHEN environment variables are loaded, THE API Server SHALL validate all required variables are present
4. WHEN the application runs, THE API Server SHALL use strict TypeScript compilation mode
5. WHEN dependencies are installed, THE API Server SHALL include all required packages for Express, Prisma, JWT, and validation

### Requirement 2: Database Setup with Prisma

**User Story:** As a developer, I want a PostgreSQL database configured with Prisma ORM, so that I can perform type-safe database operations.

#### Acceptance Criteria

1. WHEN Prisma is initialized, THE Database SHALL use PostgreSQL as the data source
2. WHEN the schema is defined, THE Database SHALL include models for User, Site, Metric, and Alert
3. WHEN migrations are run, THE Database SHALL create all tables with proper relationships and constraints
4. WHEN the Prisma client is generated, THE API Server SHALL have type-safe database access
5. WHEN seed data is provided, THE Database SHALL populate with initial test data for development

### Requirement 3: User Authentication - Registration

**User Story:** As a new user, I want to register an account with email and password, so that I can access the platform.

#### Acceptance Criteria

1. WHEN a registration request is received, THE API Server SHALL validate the email format
2. WHEN a registration request is received, THE API Server SHALL require a password of at least 8 characters
3. WHEN a user registers with an existing email, THE API Server SHALL return a 409 Conflict error
4. WHEN a valid registration is processed, THE API Server SHALL hash the password using bcrypt
5. WHEN registration succeeds, THE API Server SHALL return a JWT token and user object

### Requirement 4: User Authentication - Login

**User Story:** As a registered user, I want to log in with my credentials, so that I can access my dashboard.

#### Acceptance Criteria

1. WHEN a login request is received, THE API Server SHALL validate the email and password are provided
2. WHEN login credentials are invalid, THE API Server SHALL return a 401 Unauthorized error
3. WHEN login credentials are valid, THE API Server SHALL compare the password hash using bcrypt
4. WHEN login succeeds, THE API Server SHALL generate a JWT token with 7-day expiration
5. WHEN login succeeds, THE API Server SHALL return the token and user object without the password

### Requirement 5: JWT Token Management

**User Story:** As an authenticated user, I want my session to persist across requests, so that I don't have to log in repeatedly.

#### Acceptance Criteria

1. WHEN a JWT token is generated, THE API Server SHALL include the user ID and email in the payload
2. WHEN a JWT token is generated, THE API Server SHALL sign it with a secret key from environment variables
3. WHEN a protected endpoint is accessed, THE API Server SHALL verify the JWT token from the Authorization header
4. WHEN a JWT token is expired, THE API Server SHALL return a 401 Unauthorized error
5. WHEN a JWT token is invalid, THE API Server SHALL return a 401 Unauthorized error

### Requirement 6: Site Management - Create Site

**User Story:** As an authenticated user, I want to add a new site to monitor, so that I can track its performance metrics.

#### Acceptance Criteria

1. WHEN a create site request is received, THE API Server SHALL require authentication
2. WHEN a create site request is received, THE API Server SHALL validate the site name (3-50 characters)
3. WHEN a create site request is received, THE API Server SHALL validate the URL format
4. WHEN a site is created, THE API Server SHALL generate a unique siteId for tracking
5. WHEN a site is created, THE API Server SHALL extract and store the domain from the URL

### Requirement 7: Site Management - List Sites

**User Story:** As an authenticated user, I want to view all my monitored sites, so that I can see what I'm tracking.

#### Acceptance Criteria

1. WHEN a list sites request is received, THE API Server SHALL require authentication
2. WHEN sites are listed, THE API Server SHALL return only sites belonging to the authenticated user
3. WHEN sites are listed, THE API Server SHALL include all site properties (id, name, url, domain, siteId, isActive, timestamps)
4. WHEN no sites exist, THE API Server SHALL return an empty array
5. WHEN sites are listed, THE API Server SHALL order them by creation date descending

### Requirement 8: Site Management - Get Site Details

**User Story:** As an authenticated user, I want to view details of a specific site, so that I can see its configuration.

#### Acceptance Criteria

1. WHEN a get site request is received, THE API Server SHALL require authentication
2. WHEN a site is requested, THE API Server SHALL verify the user owns the site
3. WHEN a site is not found, THE API Server SHALL return a 404 Not Found error
4. WHEN a user requests another user's site, THE API Server SHALL return a 403 Forbidden error
5. WHEN a site is found, THE API Server SHALL return all site properties

### Requirement 9: Site Management - Update Site

**User Story:** As an authenticated user, I want to update my site's information, so that I can keep it current.

#### Acceptance Criteria

1. WHEN an update site request is received, THE API Server SHALL require authentication
2. WHEN a site is updated, THE API Server SHALL verify the user owns the site
3. WHEN a site is updated, THE API Server SHALL validate any provided name or URL
4. WHEN a site is updated, THE API Server SHALL allow updating name, url, and isActive status
5. WHEN a site is updated, THE API Server SHALL return the updated site object

### Requirement 10: Site Management - Delete Site

**User Story:** As an authenticated user, I want to delete a site I no longer monitor, so that I can keep my dashboard clean.

#### Acceptance Criteria

1. WHEN a delete site request is received, THE API Server SHALL require authentication
2. WHEN a site is deleted, THE API Server SHALL verify the user owns the site
3. WHEN a site is deleted, THE API Server SHALL also delete all associated metrics
4. WHEN a site is deleted, THE API Server SHALL also delete all associated alerts
5. WHEN a site is deleted, THE API Server SHALL return a success message

### Requirement 11: Metrics Collection - Submit Metric

**User Story:** As a tracking SDK, I want to submit performance metrics, so that they can be stored and analyzed.

#### Acceptance Criteria

1. WHEN a metric submission is received, THE API Server SHALL authenticate using the siteId header
2. WHEN a metric is submitted, THE API Server SHALL validate the siteId exists
3. WHEN a metric is submitted, THE API Server SHALL validate numeric values for LCP, FID, CLS
4. WHEN a metric is submitted, THE API Server SHALL store the timestamp, device type, and browser information
5. WHEN a metric is submitted, THE API Server SHALL return a success response immediately

### Requirement 12: Metrics Retrieval - Get Site Metrics

**User Story:** As an authenticated user, I want to retrieve metrics for my site, so that I can view performance data.

#### Acceptance Criteria

1. WHEN metrics are requested, THE API Server SHALL require authentication
2. WHEN metrics are requested, THE API Server SHALL verify the user owns the site
3. WHEN metrics are requested, THE API Server SHALL support filtering by time range (24h, 7d, 30d)
4. WHEN metrics are requested, THE API Server SHALL support filtering by device type
5. WHEN metrics are requested, THE API Server SHALL support filtering by browser name

### Requirement 13: Metrics Retrieval - Calculate Summary Statistics

**User Story:** As an authenticated user, I want to see summary statistics for my metrics, so that I can understand overall performance.

#### Acceptance Criteria

1. WHEN metrics are retrieved, THE API Server SHALL calculate average values for LCP, FID, and CLS
2. WHEN metrics are retrieved, THE API Server SHALL calculate 95th percentile values for LCP, FID, and CLS
3. WHEN metrics are retrieved, THE API Server SHALL include the total count of metrics
4. WHEN no metrics exist, THE API Server SHALL return zero values for all statistics
5. WHEN metrics are filtered, THE API Server SHALL calculate statistics only for filtered data

### Requirement 14: Alert Management - Create Alert

**User Story:** As an authenticated user, I want to create performance alerts, so that I'm notified when metrics exceed thresholds.

#### Acceptance Criteria

1. WHEN an alert is created, THE API Server SHALL require authentication
2. WHEN an alert is created, THE API Server SHALL verify the user owns the site
3. WHEN an alert is created, THE API Server SHALL validate the metric type (lcp, fid, cls)
4. WHEN an alert is created, THE API Server SHALL validate the threshold is a positive number
5. WHEN an alert is created, THE API Server SHALL validate the condition (greater_than, less_than)

### Requirement 15: Alert Management - List Alerts

**User Story:** As an authenticated user, I want to view all my alerts, so that I can see what I'm monitoring.

#### Acceptance Criteria

1. WHEN alerts are listed, THE API Server SHALL require authentication
2. WHEN alerts are listed, THE API Server SHALL return only alerts belonging to the authenticated user
3. WHEN alerts are listed, THE API Server SHALL include all alert properties
4. WHEN no alerts exist, THE API Server SHALL return an empty array
5. WHEN alerts are listed, THE API Server SHALL order them by creation date descending

### Requirement 16: Alert Management - Update Alert

**User Story:** As an authenticated user, I want to update my alert settings, so that I can adjust thresholds.

#### Acceptance Criteria

1. WHEN an alert is updated, THE API Server SHALL require authentication
2. WHEN an alert is updated, THE API Server SHALL verify the user owns the alert
3. WHEN an alert is updated, THE API Server SHALL allow updating threshold, condition, and isActive status
4. WHEN an alert is updated, THE API Server SHALL validate any provided values
5. WHEN an alert is updated, THE API Server SHALL return the updated alert object

### Requirement 17: Alert Management - Delete Alert

**User Story:** As an authenticated user, I want to delete alerts I no longer need, so that I can manage my notifications.

#### Acceptance Criteria

1. WHEN an alert is deleted, THE API Server SHALL require authentication
2. WHEN an alert is deleted, THE API Server SHALL verify the user owns the alert
3. WHEN an alert is not found, THE API Server SHALL return a 404 Not Found error
4. WHEN an alert is deleted, THE API Server SHALL remove it from the database
5. WHEN an alert is deleted, THE API Server SHALL return a success message

### Requirement 18: Input Validation

**User Story:** As a developer, I want all API inputs validated, so that invalid data doesn't reach the database.

#### Acceptance Criteria

1. WHEN any request is received, THE API Server SHALL validate request body against defined schemas
2. WHEN validation fails, THE API Server SHALL return a 400 Bad Request error with details
3. WHEN validation fails, THE API Server SHALL include which fields are invalid
4. WHEN validation succeeds, THE API Server SHALL pass sanitized data to controllers
5. WHEN validation is performed, THE API Server SHALL use a validation library (Zod or Joi)

### Requirement 19: Error Handling

**User Story:** As a developer, I want consistent error handling, so that clients receive meaningful error messages.

#### Acceptance Criteria

1. WHEN an error occurs, THE API Server SHALL return a JSON response with error details
2. WHEN an error occurs, THE API Server SHALL include an appropriate HTTP status code
3. WHEN an error occurs, THE API Server SHALL log the error with stack trace for debugging
4. WHEN a validation error occurs, THE API Server SHALL return 400 with field-specific errors
5. WHEN an unexpected error occurs, THE API Server SHALL return 500 without exposing internal details

### Requirement 20: Security - Password Hashing

**User Story:** As a security-conscious developer, I want passwords securely hashed, so that user credentials are protected.

#### Acceptance Criteria

1. WHEN a password is stored, THE API Server SHALL hash it using bcrypt with salt rounds of 10
2. WHEN a password is compared, THE API Server SHALL use bcrypt's compare function
3. WHEN a user object is returned, THE API Server SHALL never include the password hash
4. WHEN a password is validated, THE API Server SHALL check for minimum length before hashing
5. WHEN password hashing fails, THE API Server SHALL return an appropriate error

### Requirement 21: Security - CORS Configuration

**User Story:** As a developer, I want CORS properly configured, so that the frontend can access the API securely.

#### Acceptance Criteria

1. WHEN the server starts, THE API Server SHALL configure CORS middleware
2. WHEN CORS is configured, THE API Server SHALL allow requests from the frontend origin
3. WHEN CORS is configured, THE API Server SHALL allow credentials (cookies, authorization headers)
4. WHEN CORS is configured, THE API Server SHALL allow specific HTTP methods (GET, POST, PUT, DELETE)
5. WHEN CORS is configured, THE API Server SHALL allow specific headers (Content-Type, Authorization)

### Requirement 22: Security - Rate Limiting

**User Story:** As a developer, I want rate limiting implemented, so that the API is protected from abuse.

#### Acceptance Criteria

1. WHEN rate limiting is configured, THE API Server SHALL limit requests per IP address
2. WHEN rate limiting is configured, THE API Server SHALL allow 100 requests per 15 minutes per IP
3. WHEN rate limit is exceeded, THE API Server SHALL return a 429 Too Many Requests error
4. WHEN rate limit is exceeded, THE API Server SHALL include Retry-After header
5. WHEN rate limiting is applied, THE API Server SHALL exclude health check endpoints

### Requirement 23: Logging and Monitoring

**User Story:** As a developer, I want comprehensive logging, so that I can debug issues and monitor API health.

#### Acceptance Criteria

1. WHEN a request is received, THE API Server SHALL log the HTTP method, path, and timestamp
2. WHEN a request completes, THE API Server SHALL log the response status and duration
3. WHEN an error occurs, THE API Server SHALL log the error message and stack trace
4. WHEN logging is configured, THE API Server SHALL use different log levels (info, warn, error)
5. WHEN in production, THE API Server SHALL log to files and/or external logging service

### Requirement 24: Health Check Endpoint

**User Story:** As a DevOps engineer, I want a health check endpoint, so that I can monitor API availability.

#### Acceptance Criteria

1. WHEN the health check endpoint is called, THE API Server SHALL return a 200 OK status
2. WHEN the health check runs, THE API Server SHALL verify database connectivity
3. WHEN the database is unreachable, THE API Server SHALL return a 503 Service Unavailable status
4. WHEN the health check succeeds, THE API Server SHALL return uptime and version information
5. WHEN the health check endpoint is accessed, THE API Server SHALL not require authentication

### Requirement 25: Database Connection Management

**User Story:** As a developer, I want proper database connection management, so that connections are efficiently used.

#### Acceptance Criteria

1. WHEN the server starts, THE API Server SHALL establish a connection pool to PostgreSQL
2. WHEN the server shuts down, THE API Server SHALL gracefully close all database connections
3. WHEN a database query fails, THE API Server SHALL retry up to 3 times with exponential backoff
4. WHEN the connection pool is exhausted, THE API Server SHALL queue requests until connections are available
5. WHEN database errors occur, THE API Server SHALL log them with appropriate context

### Requirement 26: API Response Format

**User Story:** As a frontend developer, I want consistent API response formats, so that I can handle responses predictably.

#### Acceptance Criteria

1. WHEN a successful response is returned, THE API Server SHALL use HTTP 200 or 201 status codes
2. WHEN data is returned, THE API Server SHALL wrap it in a consistent JSON structure
3. WHEN an error occurs, THE API Server SHALL return a JSON object with error message and code
4. WHEN pagination is needed, THE API Server SHALL include page, limit, and total count
5. WHEN timestamps are returned, THE API Server SHALL use ISO 8601 format

### Requirement 27: Environment-Specific Configuration

**User Story:** As a developer, I want environment-specific configurations, so that I can run the API in different environments.

#### Acceptance Criteria

1. WHEN the server starts, THE API Server SHALL load configuration from environment variables
2. WHEN in development, THE API Server SHALL enable detailed error messages and logging
3. WHEN in production, THE API Server SHALL disable debug logging and stack traces in responses
4. WHEN environment variables are missing, THE API Server SHALL fail to start with clear error messages
5. WHEN configuration is loaded, THE API Server SHALL validate all required variables are present

### Requirement 28: Database Migrations

**User Story:** As a developer, I want database migrations managed by Prisma, so that schema changes are tracked and reproducible.

#### Acceptance Criteria

1. WHEN a schema change is made, THE API Server SHALL generate a migration file using Prisma
2. WHEN migrations are run, THE API Server SHALL apply them in order
3. WHEN a migration fails, THE API Server SHALL rollback the transaction
4. WHEN migrations are applied, THE API Server SHALL update the migration history table
5. WHEN the database is reset, THE API Server SHALL be able to recreate the schema from migrations

### Requirement 29: API Documentation

**User Story:** As a frontend developer, I want API documentation, so that I know how to use each endpoint.

#### Acceptance Criteria

1. WHEN documentation is generated, THE API Server SHALL include all endpoints with descriptions
2. WHEN documentation is generated, THE API Server SHALL include request/response examples
3. WHEN documentation is generated, THE API Server SHALL include authentication requirements
4. WHEN documentation is generated, THE API Server SHALL include error codes and meanings
5. WHEN documentation is accessed, THE API Server SHALL serve it at /api/docs endpoint

### Requirement 30: Testing Infrastructure

**User Story:** As a developer, I want a testing framework configured, so that I can write and run tests.

#### Acceptance Criteria

1. WHEN tests are run, THE API Server SHALL use Jest as the testing framework
2. WHEN tests are run, THE API Server SHALL use a separate test database
3. WHEN tests are run, THE API Server SHALL reset the database before each test suite
4. WHEN tests are run, THE API Server SHALL provide utilities for creating test data
5. WHEN tests complete, THE API Server SHALL report coverage statistics
