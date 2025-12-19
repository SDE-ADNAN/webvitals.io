# Week 3 API Integration Checklist

This document provides a comprehensive checklist for integrating the frontend dashboard with the backend API in Week 3.

## Prerequisites

- ✅ Week 1 frontend dashboard complete
- ✅ Mock data infrastructure in place
- ✅ Type definitions matching Prisma schema
- ✅ API client configured with interceptors
- ✅ React Query hooks ready for API integration

## Backend API Requirements

### Database Schema (Prisma)

The backend must implement the following Prisma schema:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  firstName String?
  lastName  String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sites     Site[]
  alerts    Alert[]
}

model Site {
  id        Int      @id @default(autoincrement())
  userId    Int
  name      String
  url       String
  domain    String
  siteId    String   @unique // Public tracking ID
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id])
  metrics   Metric[]
  alerts    Alert[]
}

model Metric {
  id             Int      @id @default(autoincrement())
  siteId         Int
  lcp            Float?
  fid            Float?
  cls            Float?
  ttfb           Float?
  fcp            Float?
  tti            Float?
  deviceType     String
  browserName    String?
  osName         String?
  pageUrl        String?
  pageTitle      String?
  connectionType String?
  effectiveType  String?
  rtt            Int?
  downlink       Float?
  sessionId      String?
  userId         String?
  timestamp      DateTime @default(now())
  site           Site     @relation(fields: [siteId], references: [id])
}

model Alert {
  id          Int      @id @default(autoincrement())
  userId      Int
  siteId      Int
  metricType  String
  threshold   Float
  condition   String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id])
  site        Site     @relation(fields: [siteId], references: [id])
}
```

## Integration Steps

### Step 1: Environment Configuration

- [ ] Update `.env.local` in `apps/web`:
  ```env
  NEXT_PUBLIC_USE_MOCK_DATA=false
  NEXT_PUBLIC_API_URL=http://localhost:4000/api
  NEXT_PUBLIC_WS_URL=ws://localhost:4000
  ```

- [ ] Create `.env` in `apps/api`:
  ```env
  NODE_ENV=development
  PORT=4000
  DATABASE_URL=postgresql://user:password@localhost:5432/webvitals
  REDIS_URL=redis://localhost:6379
  JWT_SECRET=your-secret-key-change-in-production
  JWT_EXPIRES_IN=7d
  ```

### Step 2: Backend API Endpoints

#### Authentication Endpoints

- [ ] `POST /api/auth/register`
  - Request: `{ email: string, password: string, firstName?: string, lastName?: string }`
  - Response: `{ user: User, token: string }`
  - Validation: Email format, password min 8 chars

- [ ] `POST /api/auth/login`
  - Request: `{ email: string, password: string }`
  - Response: `{ user: User, token: string }`
  - Error: 401 for invalid credentials

- [ ] `POST /api/auth/logout`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: string }`

- [ ] `GET /api/auth/me`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ user: User }`
  - Error: 401 if token invalid/expired

#### Site Management Endpoints

- [ ] `GET /api/sites`
  - Headers: `Authorization: Bearer <token>`
  - Response: `Site[]`
  - Filter by userId from token

- [ ] `GET /api/sites/:siteId`
  - Headers: `Authorization: Bearer <token>`
  - Response: `Site`
  - Error: 404 if not found, 403 if not owned by user

- [ ] `POST /api/sites`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ name: string, url: string }`
  - Response: `Site`
  - Generate unique `siteId` and extract `domain` from URL

- [ ] `PUT /api/sites/:siteId`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ name?: string, url?: string, isActive?: boolean }`
  - Response: `Site`
  - Error: 403 if not owned by user

- [ ] `DELETE /api/sites/:siteId`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: string }`
  - Error: 403 if not owned by user

#### Metrics Endpoints

- [ ] `GET /api/metrics/:siteId`
  - Headers: `Authorization: Bearer <token>`
  - Query params: `timeRange`, `deviceType`, `browserName`
  - Response: `{ metrics: Metric[], summary: MetricSummary }`
  - Calculate summary stats (avg, p95)

- [ ] `POST /api/metrics`
  - Headers: `X-Site-ID: <siteId>` (from tracking SDK)
  - Request: `Metric` (without id, siteId, timestamp)
  - Response: `{ success: boolean }`
  - Public endpoint (no auth required)

- [ ] `GET /api/metrics/:siteId/summary`
  - Headers: `Authorization: Bearer <token>`
  - Query params: `timeRange`
  - Response: `MetricSummary`

#### Alert Endpoints

- [ ] `GET /api/alerts`
  - Headers: `Authorization: Bearer <token>`
  - Response: `Alert[]`
  - Filter by userId from token

- [ ] `POST /api/alerts`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ siteId: number, metricType: string, threshold: number, condition: string }`
  - Response: `Alert`

- [ ] `PUT /api/alerts/:alertId`
  - Headers: `Authorization: Bearer <token>`
  - Request: `{ threshold?: number, condition?: string, isActive?: boolean }`
  - Response: `Alert`

- [ ] `DELETE /api/alerts/:alertId`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ message: string }`

### Step 3: Update Frontend React Query Hooks

#### useSites Hook

- [ ] Update `lib/react-query/queries/useSites.ts`:
  ```typescript
  import { apiClient } from '@/lib/api/client';
  import { Site } from '@repo/types';
  
  export function useSites() {
    return useQuery({
      queryKey: ['sites'],
      queryFn: async () => {
        const response = await apiClient.get<Site[]>('/sites');
        return response.data;
      },
    });
  }
  
  export function useSite(siteId: string) {
    return useQuery({
      queryKey: ['sites', siteId],
      queryFn: async () => {
        const response = await apiClient.get<Site>(`/sites/${siteId}`);
        return response.data;
      },
      enabled: !!siteId,
    });
  }
  ```

#### useMetrics Hook

- [ ] Update `lib/react-query/queries/useMetrics.ts`:
  ```typescript
  import { apiClient } from '@/lib/api/client';
  import { Metric, MetricSummary, MetricFilters } from '@repo/types';
  
  export function useMetrics(siteId: string, filters: MetricFilters) {
    return useQuery({
      queryKey: ['metrics', siteId, filters],
      queryFn: async () => {
        const response = await apiClient.get<{
          metrics: Metric[];
          summary: MetricSummary;
        }>(`/metrics/${siteId}`, { params: filters });
        return response.data;
      },
      enabled: !!siteId,
    });
  }
  ```

#### Authentication Mutations

- [ ] Create `lib/react-query/mutations/useAuth.ts`:
  ```typescript
  import { useMutation } from '@tanstack/react-query';
  import { apiClient } from '@/lib/api/client';
  import { useAppDispatch } from '@/lib/redux/hooks';
  import { setUser, setToken } from '@/lib/redux/slices/userSlice';
  
  export function useLogin() {
    const dispatch = useAppDispatch();
    
    return useMutation({
      mutationFn: async (credentials: { email: string; password: string }) => {
        const response = await apiClient.post('/auth/login', credentials);
        return response.data;
      },
      onSuccess: (data) => {
        dispatch(setUser(data.user));
        dispatch(setToken(data.token));
      },
    });
  }
  
  export function useRegister() {
    const dispatch = useAppDispatch();
    
    return useMutation({
      mutationFn: async (data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
      }) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
      },
      onSuccess: (data) => {
        dispatch(setUser(data.user));
        dispatch(setToken(data.token));
      },
    });
  }
  ```

### Step 4: Testing

#### Unit Tests

- [ ] Test API client interceptors
- [ ] Test React Query hooks with mock API responses
- [ ] Test authentication flow
- [ ] Test error handling (401, 404, 500)

#### Integration Tests

- [ ] Test login → dashboard flow
- [ ] Test site creation → site details flow
- [ ] Test metric filtering
- [ ] Test alert creation

#### Manual Testing

- [ ] Register new user
- [ ] Login with credentials
- [ ] Create new site
- [ ] View site details
- [ ] Apply filters (time range, device, browser)
- [ ] Create alert
- [ ] Logout and verify token cleared

### Step 5: Error Handling

- [ ] Verify 401 errors redirect to login
- [ ] Verify network errors show user-friendly messages
- [ ] Verify validation errors display on forms
- [ ] Verify loading states show skeletons
- [ ] Verify error boundary catches component errors

### Step 6: Performance

- [ ] Verify React Query caching works
- [ ] Verify API response times < 200ms
- [ ] Verify no unnecessary re-renders
- [ ] Verify bundle size unchanged

## Verification Checklist

### Authentication

- [ ] User can register with email/password
- [ ] User can login with credentials
- [ ] Invalid credentials show error
- [ ] Token persists in localStorage
- [ ] Token included in API requests
- [ ] Expired token redirects to login
- [ ] User can logout successfully

### Site Management

- [ ] User can view all their sites
- [ ] User can create new site
- [ ] Site URL validation works
- [ ] User can view site details
- [ ] User can update site
- [ ] User can delete site
- [ ] User cannot access other users' sites

### Metrics

- [ ] Metrics display for site
- [ ] Time range filter works
- [ ] Device type filter works
- [ ] Browser filter works
- [ ] Charts update with filtered data
- [ ] Summary stats calculate correctly
- [ ] No metrics shows empty state

### Alerts

- [ ] User can view alerts
- [ ] User can create alert
- [ ] Alert validation works
- [ ] User can update alert
- [ ] User can delete alert

## Rollback Plan

If integration fails:

1. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`
2. Restart frontend dev server
3. Application continues working with mock data
4. Debug backend issues separately

## Post-Integration Tasks

- [ ] Update documentation with API examples
- [ ] Add API response caching strategy
- [ ] Implement rate limiting on backend
- [ ] Add request/response logging
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CORS properly
- [ ] Add API versioning (/api/v1)
- [ ] Document API with Swagger/OpenAPI

## Week 4 Preparation

After successful API integration:

- [ ] Implement WebSocket server
- [ ] Add real-time metric updates
- [ ] Implement tracking SDK
- [ ] Set up Docker containers
- [ ] Configure AWS deployment
- [ ] Set up CI/CD pipeline

## Notes

- Mock data structure exactly matches API responses
- No frontend code changes needed beyond React Query hooks
- API client already configured with interceptors
- Redux state management ready for authentication
- Error handling already implemented
- Loading states already implemented

## Support

For issues during integration:

1. Check backend API logs
2. Check browser network tab
3. Check Redux DevTools for state
4. Check React Query DevTools for cache
5. Review error messages in console
6. Refer to design document for expected data structures
