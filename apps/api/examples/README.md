# React Query Integration Examples

This directory contains production-ready example files for integrating the WebVitals.io backend API with your React/Next.js frontend using React Query and TypeScript.

## Files

### 1. `react-query-types.ts`
Complete TypeScript type definitions matching the backend API schema.

**Includes:**
- User, Site, Metric, Alert types
- Request input types (RegisterInput, CreateSiteInput, etc.)
- Response wrapper types (AuthResponse, SitesResponse, etc.)
- API error types

**Usage:**
```typescript
import type { User, Site, CreateSiteInput } from '@/lib/api/types';
```

### 2. `react-query-client.ts`
Configured Axios client with authentication and error handling.

**Features:**
- Automatic JWT token injection
- Request/response logging (development only)
- Automatic 401 handling (redirect to login)
- Token management helpers
- Error message extraction

**Usage:**
```typescript
import apiClient, { setAuthToken, getErrorMessage } from '@/lib/api/client';
```

### 3. `react-query-hooks.ts`
Complete set of React Query hooks for all API endpoints.

**Includes:**
- Authentication hooks (register, login, logout, getCurrentUser)
- Site management hooks (CRUD operations)
- Metrics hooks (with filtering)
- Alert management hooks (CRUD operations)
- Automatic cache invalidation
- Optimistic updates support

**Usage:**
```typescript
import { useLogin, useSites, useMetrics } from '@/lib/api/hooks';
```

### 4. `react-query-examples.tsx`
Real-world component examples showing how to use the hooks.

**Includes:**
- Login and registration forms
- Site management dashboard
- Metrics visualization with filters
- Alert configuration UI
- Error handling patterns
- Loading states
- Optimistic updates

## Quick Start

### 1. Copy Files to Your Project

```bash
# From your frontend directory
mkdir -p lib/api
cp apps/api/examples/react-query-types.ts lib/api/types.ts
cp apps/api/examples/react-query-client.ts lib/api/client.ts
cp apps/api/examples/react-query-hooks.ts lib/api/hooks.ts
```

### 2. Install Dependencies

```bash
npm install @tanstack/react-query axios
```

### 3. Configure Environment

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 4. Set Up React Query Provider

```tsx
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 5. Use in Components

```tsx
import { useLogin, useSites } from '@/lib/api/hooks';

function Dashboard() {
  const { data, isLoading } = useSites();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {data?.sites.map(site => (
        <div key={site.id}>{site.name}</div>
      ))}
    </div>
  );
}
```

## Authentication Flow

### 1. Login/Register

```typescript
const login = useLogin({
  onSuccess: (data) => {
    // Token automatically stored in localStorage
    // User data cached in React Query
    router.push('/dashboard');
  },
});

login.mutate({ email, password });
```

### 2. Authenticated Requests

All hooks automatically include the JWT token in requests:

```typescript
const { data } = useSites(); // Token added automatically
```

### 3. Token Expiration

When the token expires (7 days):
- 401 response triggers automatic redirect to login
- Token is removed from localStorage
- All cached data is cleared

### 4. Logout

```typescript
const logout = useLogout();
logout.mutate(); // Clears token and cache
```

## Hook Examples

### Authentication

```typescript
// Register
const register = useRegister();
register.mutate({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
});

// Login
const login = useLogin();
login.mutate({ email, password });

// Get current user
const { data } = useCurrentUser();

// Logout
const logout = useLogout();
logout.mutate();
```

### Site Management

```typescript
// List sites
const { data } = useSites();

// Get specific site
const { data } = useSite(siteId);

// Create site
const createSite = useCreateSite();
createSite.mutate({ name: 'My Site', url: 'https://example.com' });

// Update site
const updateSite = useUpdateSite();
updateSite.mutate({ siteId, input: { name: 'New Name' } });

// Delete site
const deleteSite = useDeleteSite();
deleteSite.mutate(siteId);
```

### Metrics

```typescript
// Get metrics with filters
const { data } = useMetrics(siteId, {
  timeRange: '7d',
  deviceType: 'desktop',
  browserName: 'chrome',
});

// Get summary statistics
const { data } = useMetricsSummary(siteId, {
  timeRange: '30d',
});
```

### Alerts

```typescript
// List alerts
const { data } = useAlerts();

// Create alert
const createAlert = useCreateAlert();
createAlert.mutate({
  siteId: 1,
  metricType: 'lcp',
  threshold: 2500,
  condition: 'greater_than',
});

// Update alert
const updateAlert = useUpdateAlert();
updateAlert.mutate({ alertId, input: { threshold: 3000 } });

// Delete alert
const deleteAlert = useDeleteAlert();
deleteAlert.mutate(alertId);
```

## Error Handling

```typescript
import { getErrorMessage } from '@/lib/api/client';

const { data, error } = useSites();

if (error) {
  const message = getErrorMessage(error);
  console.error('Error:', message);
}
```

### Error Types

- **400** - Validation error
- **401** - Unauthorized (automatic redirect)
- **403** - Forbidden (user doesn't own resource)
- **404** - Not found
- **429** - Rate limit exceeded
- **500** - Server error

## Best Practices

### 1. Handle Loading States

```typescript
const { data, isLoading, error } = useSites();

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <SitesList sites={data.sites} />;
```

### 2. Optimistic Updates

```typescript
const updateSite = useUpdateSite({
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.sites });
    const previous = queryClient.getQueryData(queryKeys.sites);
    
    queryClient.setQueryData(queryKeys.sites, (old) => {
      // Update optimistically
    });
    
    return { previous };
  },
  onError: (err, variables, context) => {
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

### 4. Polling

```typescript
const { data } = useMetricsSummary(siteId, filters, {
  refetchInterval: 30000, // Refetch every 30 seconds
});
```

## Type Safety

All hooks are fully typed with TypeScript:

```typescript
// Input types are enforced
const createSite = useCreateSite();
createSite.mutate({
  name: 'My Site', // ✓ Required
  url: 'https://example.com', // ✓ Required
  // invalid: 'field', // ✗ Type error
});

// Response types are inferred
const { data } = useSites();
if (data) {
  data.sites.forEach(site => {
    console.log(site.name); // ✓ Type-safe
    // console.log(site.invalid); // ✗ Type error
  });
}
```

## Testing

### Mock API Responses

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useSites } from '@/lib/api/hooks';

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

test('useSites returns sites', async () => {
  const { result } = renderHook(() => useSites(), { wrapper });
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  
  expect(result.current.data?.sites).toBeDefined();
});
```

## Additional Resources

- [React Query Integration Guide](../REACT_QUERY_INTEGRATION.md)
- [API Integration Guide](../INTEGRATION_GUIDE.md)
- [API Documentation](http://localhost:4000/api/docs)
- [React Query Docs](https://tanstack.com/query/latest)

## Support

For issues or questions:

1. Check the [Integration Guide](../INTEGRATION_GUIDE.md)
2. Review [API Documentation](http://localhost:4000/api/docs)
3. Check browser console for errors
4. Use React Query DevTools for debugging
