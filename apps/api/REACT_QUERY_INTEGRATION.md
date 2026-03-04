# React Query Integration Guide

Complete TypeScript types and React Query hooks for integrating the WebVitals.io backend API with your frontend.

## Quick Start

```bash
npm install @tanstack/react-query axios
```

## Example Files

This directory contains complete, production-ready example files:

- **`examples/react-query-types.ts`** - All TypeScript type definitions matching the API
- **`examples/react-query-client.ts`** - Axios client with JWT auth and error handling
- **`examples/react-query-hooks.ts`** - Complete React Query hooks for all endpoints
- **`examples/react-query-examples.tsx`** - Usage examples for all hooks

## Table of Contents

1. [Setup](#setup)
2. [Authentication Flow](#authentication-flow)
3. [Hook Reference](#hook-reference)
4. [Error Handling](#error-handling)
5. [Best Practices](#best-practices)

---

## Setup

### 1. Install Dependencies

```bash
npm install @tanstack/react-query axios
```

### 2. Copy Example Files

Copy the example files to your frontend project:

```bash
# From your frontend directory
mkdir -p lib/api
cp apps/api/examples/react-query-types.ts lib/api/types.ts
cp apps/api/examples/react-query-client.ts lib/api/client.ts
cp apps/api/examples/react-query-hooks.ts lib/api/hooks.ts
```

### 3. Configure React Query Provider

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            cacheTime: 10 * 60 * 1000, // 10 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 4. Set Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Authentication Flow

### Registration

```typescript
import { useRegister } from '@/lib/api/hooks';

const register = useRegister({
  onSuccess: (data) => {
    // Token automatically stored in localStorage
    // User data cached in React Query
    router.push('/dashboard');
  },
});

register.mutate({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
});
```

### Login

```typescript
import { useLogin } from '@/lib/api/hooks';

const login = useLogin({
  onSuccess: (data) => {
    // Token automatically stored
    router.push('/dashboard');
  },
});

login.mutate({
  email: 'user@example.com',
  password: 'password123',
});
```

### Get Current User

```typescript
import { useCurrentUser } from '@/lib/api/hooks';

const { data, isLoading } = useCurrentUser();

if (data) {
  console.log('Current user:', data.user);
}
```

### Logout

```typescript
import { useLogout } from '@/lib/api/hooks';

const logout = useLogout();

logout.mutate(); // Clears token and all cached data
```

---

## Hook Reference

### Authentication Hooks

- `useRegister(options?)` - Register new user
- `useLogin(options?)` - Login user
- `useLogout()` - Logout and clear cache
- `useCurrentUser(options?)` - Get authenticated user

### Site Management Hooks

- `useSites(options?)` - Get all sites
- `useSite(siteId, options?)` - Get specific site
- `useCreateSite(options?)` - Create new site
- `useUpdateSite(options?)` - Update site
- `useDeleteSite(options?)` - Delete site

### Metrics Hooks

- `useMetrics(siteId, filters?, options?)` - Get metrics with filters
- `useMetricsSummary(siteId, filters?, options?)` - Get aggregated summary

### Alert Management Hooks

- `useAlerts(options?)` - Get all alerts
- `useCreateAlert(options?)` - Create new alert
- `useUpdateAlert(options?)` - Update alert
- `useDeleteAlert(options?)` - Delete alert

---

## Error Handling

All hooks use consistent error handling:

```typescript
import { getErrorMessage } from '@/lib/api/client';

const { data, error } = useSites();

if (error) {
  const message = getErrorMessage(error);
  console.error('Error:', message);
}
```

### Automatic 401 Handling

When a 401 error occurs:
1. Token is removed from localStorage
2. User is redirected to `/auth/login`
3. All cached data is cleared

### Error Types

- **400** - Validation error (check `error.response.data.details`)
- **401** - Unauthorized (automatic redirect to login)
- **403** - Forbidden (user doesn't own resource)
- **404** - Not found
- **429** - Rate limit exceeded (check `Retry-After` header)
- **500** - Server error

---

## Best Practices

### 1. Handle Loading States

```typescript
const { data, isLoading, error } = useSites();

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <SitesList sites={data.sites} />;
```

### 2. Use Optimistic Updates

```typescript
const updateSite = useUpdateSite({
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.sites });
    const previous = queryClient.getQueryData(queryKeys.sites);
    
    // Optimistically update UI
    queryClient.setQueryData(queryKeys.sites, (old) => {
      // Update logic
    });
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.sites, context?.previous);
  },
});
```

### 3. Dependent Queries

```typescript
const { data: site } = useSite(siteId);
const { data: metrics } = useMetrics(siteId, filters, {
  enabled: !!site, // Only fetch if site exists
});
```

### 4. Polling for Real-time Data

```typescript
const { data } = useMetricsSummary(siteId, filters, {
  refetchInterval: 30000, // Refetch every 30 seconds
});
```

### 5. Manual Cache Updates

```typescript
import { queryKeys } from '@/lib/api/hooks';

// Invalidate and refetch
queryClient.invalidateQueries({ queryKey: queryKeys.sites });

// Remove from cache
queryClient.removeQueries({ queryKey: queryKeys.site(siteId) });

// Update cache directly
queryClient.setQueryData(queryKeys.sites, newData);
```

---

## Complete Examples

See `examples/react-query-examples.tsx` for full component examples:

- Login and registration forms
- Site management dashboard
- Metrics visualization with filters
- Alert configuration
- Error handling patterns
- Loading states
- Optimistic updates

---

## API Response Types

All responses match these TypeScript interfaces:

```typescript
// Authentication
interface AuthResponse {
  user: User;
  token: string;
}

// Sites
interface SitesResponse {
  sites: Site[];
}

// Metrics
interface MetricsResponse {
  metrics: Metric[];
}

interface MetricsSummaryResponse {
  summary: {
    avgLcp: number;
    avgFid: number;
    avgCls: number;
    p95Lcp: number;
    p95Fid: number;
    p95Cls: number;
    count: number;
  };
}

// Alerts
interface AlertsResponse {
  alerts: Alert[];
}
```

See `examples/react-query-types.ts` for complete type definitions.

---

## Additional Resources

- [API Integration Guide](./INTEGRATION_GUIDE.md) - Complete API documentation
- [API Swagger Docs](http://localhost:4000/api/docs) - Interactive API explorer
- [React Query Docs](https://tanstack.com/query/latest) - Official documentation
- [Environment Variables](./ENVIRONMENT_VARIABLES.md) - Configuration guide

---

## Troubleshooting

### CORS Errors

Ensure `FRONTEND_URL` in `apps/api/.env` matches your frontend URL exactly:

```bash
FRONTEND_URL=http://localhost:3000
```

### 401 Errors

- Check that token is being sent in Authorization header
- Verify token hasn't expired (7-day expiration)
- Check JWT_SECRET matches between environments

### Type Errors

- Ensure you've copied the latest `react-query-types.ts`
- Check that API responses match expected types
- Use TypeScript strict mode for better type checking

---

## Support

For issues or questions:

1. Check [Integration Guide](./INTEGRATION_GUIDE.md)
2. Review [API Documentation](http://localhost:4000/api/docs)
3. Check browser console and network tab
4. Use React Query DevTools to inspect cache state
