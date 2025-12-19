# WebVitals Dashboard - Library Documentation

This directory contains the core library code for the WebVitals dashboard application.

## Directory Structure

```
lib/
├── api/                    # API client and HTTP utilities
│   ├── client.ts          # Axios instance with interceptors
│   └── client.test.ts     # API client tests
│
├── config/                 # Configuration utilities
│   └── env.ts             # Environment variable validation
│
├── mock-data/             # Mock data for development (Week 1)
│   ├── types.ts           # Mock data type definitions
│   ├── mockSites.ts       # Mock site data and functions
│   ├── mockMetrics.ts     # Mock metrics generator
│   └── *.property.test.ts # Property-based tests
│
├── react-query/           # React Query configuration and hooks
│   ├── queryClient.ts     # QueryClient configuration
│   └── queries/           # Query hooks
│       ├── useSites.ts    # Site data hooks
│       └── useMetrics.ts  # Metrics data hooks
│
├── redux/                 # Redux state management
│   ├── store.ts           # Redux store configuration
│   ├── hooks.ts           # Typed Redux hooks
│   └── slices/            # Redux slices
│       ├── themeSlice.ts  # Theme state
│       ├── userSlice.ts   # User/auth state
│       └── uiSlice.ts     # UI state
│
├── utils/                 # Utility functions
│   ├── metrics.ts         # Metric classification utilities
│   ├── formatters.ts      # Data formatting utilities
│   └── *.property.test.ts # Property-based tests
│
└── validations/           # Form validation schemas
    └── schemas.ts         # Zod validation schemas
```

## API Client (`lib/api/client.ts`)

The API client is configured with Axios and includes:

- **Base URL**: Configured from `NEXT_PUBLIC_API_URL` environment variable
- **Timeout**: 10 seconds
- **Request Interceptor**: Automatically adds authentication token from Redux store
- **Response Interceptor**: Handles 401 errors, timeouts, and network errors

### Usage

```typescript
import { apiClient } from "@/lib/api/client";

// GET request
const response = await apiClient.get("/sites");

// POST request
const response = await apiClient.post("/sites", { name: "My Site", url: "https://example.com" });
```

### Week 3 Integration

The API client is ready for Week 3 backend integration. Simply update the React Query hooks to use `apiClient` instead of mock data functions.

## React Query Hooks

### useSites()

Fetches all sites for the current user.

```typescript
import { useSites } from "@/lib/react-query/queries/useSites";

function MyComponent() {
  const { data: sites, isLoading, error } = useSites();
  
  if (isLoading) return <CardSkeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <SiteList sites={sites} />;
}
```

### useSite(siteId)

Fetches a single site by ID.

```typescript
import { useSite } from "@/lib/react-query/queries/useSites";

function SiteDetails({ siteId }: { siteId: string }) {
  const { data: site, isLoading } = useSite(siteId);
  
  if (isLoading) return <CardSkeleton />;
  if (!site) return <NotFound />;
  
  return <SiteInfo site={site} />;
}
```

### useMetrics(siteId, filters)

Fetches metrics for a site with optional filters.

```typescript
import { useMetrics } from "@/lib/react-query/queries/useMetrics";

function MetricsChart({ siteId }: { siteId: string }) {
  const { data, isLoading } = useMetrics(siteId, {
    timeRange: "24h",
    deviceType: "mobile",
  });
  
  if (isLoading) return <ChartSkeleton />;
  
  return <Chart metrics={data.metrics} summary={data.summary} />;
}
```

## Error Handling

### ErrorBoundary Component

Catches React component errors and displays a fallback UI.

```typescript
import { ErrorBoundary } from "@/app/components/UI/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>
```

## Loading States

### Skeleton Components

Six skeleton components for different loading scenarios:

```typescript
import {
  CardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  GridSkeleton,
  TextSkeleton,
  MetricCardSkeleton,
} from "@/app/components/UI/Skeleton";

// Single card
<CardSkeleton />

// Chart loading
<ChartSkeleton />

// Table with 10 rows
<TableSkeleton rows={10} />

// Grid of 6 cards in 3 columns
<GridSkeleton items={6} columns={3} />

// Text with 5 lines
<TextSkeleton lines={5} width="3/4" />

// Metric card
<MetricCardSkeleton />
```

## Redux State Management

### Store Structure

```typescript
{
  theme: {
    mode: "light" | "dark"
  },
  user: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    isLoading: boolean
  },
  ui: {
    sidebarOpen: boolean,
    mobileMenuOpen: boolean,
    activeModal: string | null
  }
}
```

### Usage

```typescript
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { toggleTheme } from "@/lib/redux/slices/themeSlice";

function ThemeToggle() {
  const mode = useAppSelector((state) => state.theme.mode);
  const dispatch = useAppDispatch();
  
  return (
    <button onClick={() => dispatch(toggleTheme())}>
      {mode === "light" ? "🌙" : "☀️"}
    </button>
  );
}
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Test Coverage

- **Unit Tests**: API client configuration
- **Property-Based Tests**: 
  - Theme slice (2 properties)
  - Metric classification (18 properties)
  - Mock data generation (12 properties)

Total: 37 tests passing

## Week 3 Migration Guide

To integrate with the real API in Week 3:

1. **Update React Query Hooks**: Replace mock data calls with API client calls
2. **Environment Variables**: Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
3. **API Endpoints**: Ensure backend endpoints match the expected routes

Example migration:

```typescript
// Week 1 (Mock Data)
export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => getMockSites(),
  });
}

// Week 3 (Real API)
export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      const response = await apiClient.get<Site[]>("/sites");
      return response.data;
    },
  });
}
```

## Best Practices

1. **Always use typed hooks**: Use `useAppSelector` and `useAppDispatch` instead of raw Redux hooks
2. **Handle loading states**: Always show skeleton components while data is loading
3. **Handle errors**: Wrap components in ErrorBoundary and handle query errors
4. **Use React Query**: For server state (sites, metrics), use React Query hooks
5. **Use Redux**: For client state (theme, user, UI), use Redux slices
6. **Type safety**: All components and functions are fully typed with TypeScript

## Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Axios Documentation](https://axios-http.com/)
- [Zod Documentation](https://zod.dev/)
