# Backend API Integration Guide

This guide provides step-by-step instructions for integrating the frontend dashboard with the backend API.

## Prerequisites

- ✅ Backend API running on port 4000
- ✅ PostgreSQL database configured and migrated
- ✅ Frontend dashboard running on port 3000
- ✅ All environment variables configured (see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md))

### Required Environment Variables

The following environment variables must be set in `apps/api/.env`:

```bash
# Server
NODE_ENV=development
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/webvitals
TEST_DATABASE_URL=postgresql://user:password@localhost:5432/webvitals_test

# Authentication
JWT_SECRET=your-secret-key-here-min-32-chars
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Logging (optional)
LOG_LEVEL=debug
LOG_FILE_PATH=./logs/app.log
```

**Important**: The `FRONTEND_URL` must exactly match your frontend's origin (including protocol and port) for CORS to work correctly.

For detailed documentation of all environment variables, see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md).

## Quick Start

### 1. Start the Backend API

```bash
cd apps/api
npm run dev
```

The API will be available at `http://localhost:4000`

### 2. Verify API Health

```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "API server is running",
  "database": "connected",
  "uptime": 123.456,
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Run Integration Tests

Before integrating with the frontend, run the comprehensive integration test suite:

```bash
cd apps/api
npm run test:integration
```

This will test:
- ✅ All API endpoints (auth, sites, metrics, alerts)
- ✅ CORS configuration
- ✅ Authentication flow
- ✅ Error handling (401, 403, 404, 400, 429)
- ✅ Data validation
- ✅ Cascade deletions
- ✅ API documentation accessibility

Expected output:
```
🚀 Starting Frontend Integration Tests

============================================================
  Test Summary
============================================================
Total Tests: 23
✅ Passed: 23
❌ Failed: 0
Success Rate: 100.0%
```

### 4. View API Documentation

Open your browser to: `http://localhost:4000/api/docs`

This provides interactive Swagger documentation for all endpoints.

## API Endpoints Overview

### Authentication Endpoints

#### Register New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response: Same as register

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Site Management Endpoints

#### List All Sites
```bash
GET /api/sites
Authorization: Bearer <token>
```

Response:
```json
{
  "sites": [
    {
      "id": 1,
      "userId": 1,
      "name": "My Website",
      "url": "https://example.com",
      "domain": "example.com",
      "siteId": "abc123xyz",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Site Details
```bash
GET /api/sites/:siteId
Authorization: Bearer <token>
```

#### Create Site
```bash
POST /api/sites
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Website",
  "url": "https://example.com"
}
```

#### Update Site
```bash
PUT /api/sites/:siteId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "url": "https://newurl.com",
  "isActive": false
}
```

#### Delete Site
```bash
DELETE /api/sites/:siteId
Authorization: Bearer <token>
```

### Metrics Endpoints

#### Get Site Metrics
```bash
GET /api/metrics/:siteId?timeRange=7d&deviceType=desktop&browserName=chrome
Authorization: Bearer <token>
```

Query Parameters:
- `timeRange`: `24h`, `7d`, `30d` (optional)
- `deviceType`: `desktop`, `mobile`, `tablet` (optional)
- `browserName`: `chrome`, `firefox`, `safari`, etc. (optional)

Response:
```json
{
  "metrics": [
    {
      "id": 1,
      "siteId": 1,
      "lcp": 2500,
      "fid": 100,
      "cls": 0.1,
      "deviceType": "desktop",
      "browserName": "chrome",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "summary": {
    "avgLcp": 2500,
    "avgFid": 100,
    "avgCls": 0.1,
    "p95Lcp": 3000,
    "p95Fid": 150,
    "p95Cls": 0.15,
    "count": 100
  }
}
```

#### Get Metrics Summary
```bash
GET /api/metrics/:siteId/summary?timeRange=7d
Authorization: Bearer <token>
```

#### Submit Metric (Public - No Auth)
```bash
POST /api/metrics
X-Site-ID: abc123xyz
Content-Type: application/json

{
  "lcp": 2500,
  "fid": 100,
  "cls": 0.1,
  "deviceType": "desktop",
  "browserName": "chrome",
  "osName": "Windows",
  "pageUrl": "https://example.com/page",
  "pageTitle": "Example Page"
}
```

### Alert Endpoints

#### List All Alerts
```bash
GET /api/alerts
Authorization: Bearer <token>
```

Response:
```json
{
  "alerts": [
    {
      "id": 1,
      "userId": 1,
      "siteId": 1,
      "metricType": "lcp",
      "threshold": 2500,
      "condition": "greater_than",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Create Alert
```bash
POST /api/alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": 1,
  "metricType": "lcp",
  "threshold": 2500,
  "condition": "greater_than"
}
```

#### Update Alert
```bash
PUT /api/alerts/:alertId
Authorization: Bearer <token>
Content-Type: application/json

{
  "threshold": 3000,
  "condition": "less_than",
  "isActive": false
}
```

#### Delete Alert
```bash
DELETE /api/alerts/:alertId
Authorization: Bearer <token>
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {}
}
```

### Common Error Codes

- **400 Bad Request**: Validation errors, malformed requests
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Valid auth but insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected errors

### Example Error Responses

#### Validation Error (400)
```json
{
  "error": "Validation Error",
  "message": "Invalid input data",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

#### Unauthorized (401)
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

#### Forbidden (403)
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this resource"
}
```

#### Rate Limit (429)
```json
{
  "error": "RateLimitError",
  "message": "Too many requests from this IP, please try again later."
}
```

Headers include: `Retry-After: 900` (seconds)

## Frontend Integration

### Environment Variables

Update `apps/web/.env.local`:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### API Client Configuration

The API client is already configured in `apps/web/lib/api/client.ts` with:
- Base URL from environment variable
- JWT token interceptor
- Error handling interceptor
- Request/response logging

### React Query Hooks

Example usage in components:

```typescript
import { useSites } from '@/lib/react-query/queries/useSites';

function Dashboard() {
  const { data, isLoading, error } = useSites();
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <SiteList sites={data} />;
}
```

## Testing the Integration

### 1. Test Authentication Flow

```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Save the token from the response
TOKEN="<token_from_response>"

# Test authenticated endpoint
curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Test Site Management

```bash
# Create a site
curl -X POST http://localhost:4000/api/sites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Site","url":"https://example.com"}'

# List sites
curl http://localhost:4000/api/sites \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Test Metrics

```bash
# Get metrics for a site
curl "http://localhost:4000/api/metrics/1?timeRange=7d" \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Test Alerts

```bash
# Create an alert
curl -X POST http://localhost:4000/api/alerts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"siteId":1,"metricType":"lcp","threshold":2500,"condition":"greater_than"}'

# List alerts
curl http://localhost:4000/api/alerts \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### API Not Starting

1. Check PostgreSQL is running:
   ```bash
   psql -U postgres -c "SELECT 1"
   ```

2. Verify environment variables:
   ```bash
   cat apps/api/.env
   ```

3. Check database migrations:
   ```bash
   cd apps/api
   npx prisma migrate status
   ```

### CORS Errors

If you see CORS errors in the browser console:

1. Verify `FRONTEND_URL` in `apps/api/.env` matches your frontend URL
2. Restart the API server after changing environment variables
3. Check browser console for the exact CORS error

**Common CORS Issues:**

- **Missing protocol**: Use `http://localhost:3000` not `localhost:3000`
- **Trailing slash**: Use `http://localhost:3000` not `http://localhost:3000/`
- **Wrong port**: Ensure port matches (default frontend is 3000)
- **HTTPS mismatch**: Both must use same protocol (http or https)

**Verify CORS Configuration:**

The API is configured to allow:
- **Origin**: Value from `FRONTEND_URL` environment variable
- **Credentials**: `true` (allows cookies and Authorization headers)
- **Methods**: `GET`, `POST`, `PUT`, `DELETE`
- **Headers**: `Content-Type`, `Authorization`, `X-Site-ID`

You can verify CORS is working by checking the response headers:
```bash
curl -I -X OPTIONS http://localhost:4000/api/health \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"
```

### Authentication Errors

If you get 401 errors:

1. Verify token is being sent in Authorization header
2. Check token hasn't expired (7-day expiration)
3. Verify JWT_SECRET matches between token generation and verification

### Database Errors

If you see Prisma errors:

1. Check database connection:
   ```bash
   cd apps/api
   npx prisma db pull
   ```

2. Verify schema is up to date:
   ```bash
   npx prisma migrate status
   ```

3. Reset database if needed:
   ```bash
   npx prisma migrate reset
   npx prisma db seed
   ```

## Performance Considerations

### Rate Limiting

- 100 requests per 15 minutes per IP address
- Health check endpoint excluded from rate limiting
- Retry-After header included in 429 responses

### Database Connection Pooling

- Prisma manages connection pool automatically
- Default pool size: 10 connections
- Graceful shutdown closes all connections

### Response Times

Target response times:
- p50: < 100ms
- p95: < 200ms
- p99: < 500ms

### Caching

- React Query caches API responses on frontend
- Stale time: 5 minutes
- Cache time: 10 minutes

## Security

### Authentication

- JWT tokens with 7-day expiration
- Passwords hashed with bcrypt (10 salt rounds)
- Tokens stored in localStorage on frontend

### Authorization

- All protected endpoints verify JWT token
- Ownership verification for site/alert operations
- User can only access their own resources

### Input Validation

- All request bodies validated with Zod schemas
- Email format validation
- Password minimum length: 8 characters
- URL format validation

### CORS

- Configured for specific frontend origin
- Credentials allowed
- Specific methods and headers allowed

## Monitoring

### Logging

- HTTP requests logged with Morgan
- Application logs with Winston/Pino
- Error logs include stack traces
- Production logs exclude sensitive data

### Health Check

Monitor API health:
```bash
curl http://localhost:4000/api/health
```

Expected response when healthy:
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "version": "0.1.0",
  "database": "connected"
}
```

## Next Steps

After successful integration:

1. ✅ Verify all endpoints work with frontend
2. ✅ Test error scenarios (401, 403, 404, 429)
3. ✅ Verify loading states and error messages
4. ✅ Test authentication flow end-to-end
5. ✅ Verify data persistence across page refreshes

## Support

For issues or questions:

1. Check API logs: `apps/api/logs/`
2. Check browser network tab for request/response details
3. Review Swagger documentation: `http://localhost:4000/api/docs`
4. Check Redux DevTools for authentication state
5. Check React Query DevTools for cache state

## Additional Resources

- [API Design Document](./README.md)
- [Prisma Schema](./prisma/schema.prisma)
- [Environment Configuration](./src/config/env.ts)
- [Swagger Documentation](http://localhost:4000/api/docs)
