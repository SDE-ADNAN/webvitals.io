# Design Document - Frontend Dashboard (Week 1)

## Overview

This design document specifies the architecture, components, data flow, and implementation patterns for the WebVitals.io frontend dashboard. The application is built using Next.js 15 with the App Router, React 19, TypeScript, Redux Toolkit for client state, React Query for server state, and Tailwind CSS for styling.

The frontend dashboard serves as a standalone application during Week 1, using mock data to simulate the full user experience. The architecture is designed to seamlessly integrate with the backend API in Week 3 by simply swapping mock data sources with real API calls.

**Key Design Principles:**

- Component-based architecture with clear separation of concerns
- Type-safe development using TypeScript throughout
- Responsive design supporting mobile, tablet, and desktop
- Accessibility-first approach following WCAG 2.1 AA standards
- Performance-optimized with code splitting and lazy loading
- Mock data structured to match future API responses exactly

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Pages (app/)                                         │  │
│  │  - layout.tsx (root layout)                          │  │
│  │  - page.tsx (landing/marketing)                      │  │
│  │  - dashboard/page.tsx (main dashboard)               │  │
│  │  - dashboard/[siteId]/page.tsx (site details)       │  │
│  │  - auth/login/page.tsx                               │  │
│  │  - auth/signup/page.tsx                              │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Component Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Layout     │  │  Dashboard   │  │   Charts     │     │
│  │  Components  │  │  Components  │  │  Components  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    State Management                          │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │  Redux Toolkit   │         │   React Query    │         │
│  │  (Client State)  │         │  (Server State)  │         │
│  │  - theme         │         │  - sites         │         │
│  │  - user          │         │  - metrics       │         │
│  │  - ui            │         │  - alerts        │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer (Week 1)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Mock Data Services (lib/mock-data/)                 │  │
│  │  - mockSites.ts                                      │  │
│  │  - mockMetrics.ts                                    │  │
│  │  - mockAlerts.ts                                     │  │
│  │  (Structured to match future API responses)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Core Framework:**

- Next.js 15.0+ (App Router, React Server Components)
- React 19.0+
- TypeScript 5.3+ (strict mode)

**State Management:**

- Redux Toolkit 2.0+ (client state: theme, user, UI)
- React Query 5.0+ (server state: sites, metrics, alerts)

**Styling:**

- Tailwind CSS 3.4+
- CSS Modules (for component-specific styles when needed)

**Data Visualization:**

- Recharts 2.10+ (charts and graphs)

**Form Handling:**

- React Hook Form 7.49+
- Zod 3.22+ (validation schemas)

**HTTP Client:**

- Axios 1.6+ (configured with interceptors)

**Development Tools:**

- ESLint 8.56+ (with TypeScript and React plugins)
- Prettier 3.1+ (code formatting)
- Jest 29.7+ (unit testing)
- React Testing Library 14.1+ (component testing)

## Components and Interfaces

### Component Hierarchy

```
app/
├── layout.tsx (RootLayout)
│   └── Providers (Redux, React Query, Theme)
│
├── page.tsx (Landing/Marketing Page)
│
├── dashboard/
│   ├── layout.tsx (DashboardLayout)
│   │   ├── Sidebar
│   │   ├── Header
│   │   └── MobileNav
│   │
│   ├── page.tsx (Dashboard Overview)
│   │   ├── SiteOverviewGrid
│   │   │   └── SiteCard (multiple)
│   │   ├── EmptyState
│   │   └── AddSiteModal
│   │
│   ├── [siteId]/
│   │   └── page.tsx (Site Details)
│   │       ├── SiteHeader
│   │       ├── MetricsGrid
│   │       │   └── MetricCard (LCP, FID, CLS)
│   │       ├── TimeRangeSelector
│   │       ├── FilterBar
│   │       ├── LCPChart
│   │       ├── FIDChart
│   │       └── CLSChart
│   │
│   ├── settings/
│   │   └── page.tsx (Settings)
│   │
│   └── alerts/
│       └── page.tsx (Alerts)
│
└── auth/
    ├── login/
    │   └── page.tsx (Login)
    │       └── LoginForm
    └── signup/
        └── page.tsx (Signup)
            └── SignupForm
```

### Component File Structure

```
app/
├── components/
│   ├── Layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MainLayout.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── Navigation/
│   │   ├── NavMenu.tsx
│   │   └── NavLink.tsx
│   │
│   ├── Theme/
│   │   └── ThemeToggle.tsx
│   │
│   ├── Dashboard/
│   │   ├── SiteCard.tsx
│   │   ├── SiteOverviewGrid.tsx
│   │   ├── EmptyState.tsx
│   │   └── AddSiteModal.tsx
│   │
│   ├── SiteDetails/
│   │   ├── SiteHeader.tsx
│   │   ├── MetricsGrid.tsx
│   │   ├── MetricCard.tsx
│   │   ├── TimeRangeSelector.tsx
│   │   └── FilterBar.tsx
│   │
│   ├── Charts/
│   │   ├── LCPChart.tsx
│   │   ├── FIDChart.tsx
│   │   ├── CLSChart.tsx
│   │   └── ChartContainer.tsx
│   │
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   │
│   └── UI/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Skeleton.tsx
│       └── ErrorBoundary.tsx
│
├── lib/
│   ├── redux/
│   │   ├── store.ts
│   │   ├── slices/
│   │   │   ├── themeSlice.ts
│   │   │   ├── userSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── hooks.ts
│   │
│   ├── react-query/
│   │   ├── queryClient.ts
│   │   └── queries/
│   │       ├── useSites.ts
│   │       └── useMetrics.ts
│   │
│   ├── mock-data/
│   │   ├── mockSites.ts
│   │   ├── mockMetrics.ts
│   │   └── types.ts
│   │
│   ├── api/
│   │   └── client.ts
│   │
│   ├── utils/
│   │   ├── metrics.ts
│   │   └── formatters.ts
│   │
│   └── validations/
│       └── schemas.ts
│
└── types/
    ├── site.ts
    ├── metric.ts
    └── user.ts
```

### Key Component Specifications

#### Sidebar Component

```typescript
// app/components/Layout/Sidebar.tsx
interface SidebarProps {
  className?: string;
}

// Features:
// - Displays navigation links (Dashboard, Sites, Alerts, Settings)
// - Highlights active route
// - Shows user avatar and name at bottom
// - Responsive: hidden on mobile (< 768px)
// - Fixed position on desktop
```

#### Header Component

```typescript
// app/components/Layout/Header.tsx
interface HeaderProps {
  title?: string;
  showMobileMenu?: boolean;
  onMobileMenuToggle?: () => void;
}

// Features:
// - Displays page title
// - Shows theme toggle button
// - Shows mobile menu button (< 768px)
// - Displays user avatar with dropdown menu
```

#### SiteCard Component

```typescript
// app/components/Dashboard/SiteCard.tsx
interface SiteCardProps {
  site: {
    id: number;
    name: string;
    url: string;
    siteId: string;
    lastMetric?: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  onClick?: () => void;
}

// Features:
// - Displays site name and URL
// - Shows latest LCP, FID, CLS values with color-coded badges
// - Hover effect with shadow
// - Click navigates to site details page
```

#### MetricCard Component

```typescript
// app/components/SiteDetails/MetricCard.tsx
interface MetricCardProps {
  metricName: "LCP" | "FID" | "CLS";
  value: number;
  unit: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
}

// Features:
// - Displays metric name, value, and unit
// - Color-coded status indicator (green/yellow/red)
// - Trend arrow and percentage change
// - Tooltip with threshold information
```

#### Chart Components

```typescript
// app/components/Charts/LCPChart.tsx
interface LCPChartProps {
  data: Array<{
    timestamp: number;
    value: number;
  }>;
  timeRange: "24h" | "7d" | "30d";
}

// Features:
// - Line chart using Recharts
// - X-axis: time, Y-axis: LCP value (ms)
// - Threshold lines at 2500ms (good) and 4000ms (poor)
// - Tooltip showing exact values
// - Responsive sizing
```

## Data Models

### TypeScript Interfaces

```typescript
// types/site.ts
export interface Site {
  id: number;
  userId: number;
  name: string;
  url: string;
  domain: string;
  siteId: string; // Public tracking ID
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// types/metric.ts
export interface Metric {
  id: number;
  siteId: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
  fcp?: number;
  tti?: number;
  deviceType: "mobile" | "desktop" | "tablet";
  browserName?: string;
  osName?: string;
  pageUrl?: string;
  pageTitle?: string;
  connectionType?: string;
  effectiveType?: string;
  rtt?: number;
  downlink?: number;
  sessionId?: string;
  userId?: string;
  timestamp: string;
}

export interface MetricSummary {
  avgLcp: number;
  avgFid: number;
  avgCls: number;
  p95Lcp: number;
  p95Fid: number;
  p95Cls: number;
  count: number;
}

// types/user.ts
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### Redux Store Structure

```typescript
// lib/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import uiReducer from "./slices/uiSlice";

// Persist configuration
const themePersistConfig = {
  key: "theme",
  storage,
};

const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["token", "user"], // Only persist token and user data
};

// Create persisted reducers
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

export const store = configureStore({
  reducer: {
    theme: persistedThemeReducer,
    user: persistedUserReducer,
    ui: uiReducer, // UI state is not persisted
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Theme Slice

```typescript
// lib/redux/slices/themeSlice.ts
interface ThemeState {
  mode: "light" | "dark";
}

const initialState: ThemeState = {
  mode: "light",
};

// Actions:
// - toggleTheme()
// - setTheme(mode: 'light' | 'dark')

// Selectors:
// - selectThemeMode(state: RootState) => 'light' | 'dark'
```

#### User Slice

```typescript
// lib/redux/slices/userSlice.ts
interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Actions:
// - setUser(user: User)
// - setToken(token: string)
// - logout()
// - setLoading(isLoading: boolean)

// Selectors:
// - selectUser(state: RootState) => User | null
// - selectIsAuthenticated(state: RootState) => boolean
```

#### UI Slice

```typescript
// lib/redux/slices/uiSlice.ts
interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  activeModal: string | null;
}

// Actions:
// - toggleSidebar()
// - toggleMobileMenu()
// - openModal(modalId: string)
// - closeModal()

// Selectors:
// - selectSidebarOpen(state: RootState) => boolean
// - selectActiveModal(state: RootState) => string | null
```

### React Query Configuration

```typescript
// lib/react-query/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for network errors and 5xx errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
    mutations: {
      retry: false, // Don't retry mutations by default
    },
  },
});
```

#### Query Hooks

```typescript
// lib/react-query/queries/useSites.ts
export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      // Week 1: Return mock data
      // Week 3: Replace with API call
      return getMockSites();
    },
  });
}

export function useSite(siteId: string) {
  return useQuery({
    queryKey: ["sites", siteId],
    queryFn: async () => {
      return getMockSite(siteId);
    },
    enabled: !!siteId,
  });
}

// lib/react-query/queries/useMetrics.ts
export function useMetrics(siteId: string, filters: MetricFilters) {
  return useQuery({
    queryKey: ["metrics", siteId, filters],
    queryFn: async () => {
      return getMockMetrics(siteId, filters);
    },
    enabled: !!siteId,
  });
}
```

### Mock Data Structure

```typescript
// lib/mock-data/mockSites.ts
export const mockSites: Site[] = [
  {
    id: 1,
    userId: 1,
    name: "My Portfolio",
    url: "https://myportfolio.com",
    domain: "myportfolio.com",
    siteId: "site_abc123",
    isActive: true,
    createdAt: "2025-12-01T00:00:00Z",
    updatedAt: "2025-12-14T00:00:00Z",
  },
  {
    id: 2,
    userId: 1,
    name: "E-commerce Store",
    url: "https://mystore.com",
    domain: "mystore.com",
    siteId: "site_def456",
    isActive: true,
    createdAt: "2025-12-05T00:00:00Z",
    updatedAt: "2025-12-14T00:00:00Z",
  },
];

export function getMockSites(): Promise<Site[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockSites), 500);
  });
}

export function getMockSite(siteId: string): Promise<Site | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const site = mockSites.find((s) => s.siteId === siteId);
      resolve(site || null);
    }, 300);
  });
}
```

```typescript
// lib/mock-data/mockMetrics.ts
export function generateMockMetrics(
  siteId: string,
  count: number = 100
): Metric[] {
  const metrics: Metric[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    metrics.push({
      id: i + 1,
      siteId: parseInt(siteId),
      lcp: Math.random() * 5000 + 1000, // 1000-6000ms
      fid: Math.random() * 400 + 50, // 50-450ms
      cls: Math.random() * 0.4, // 0-0.4
      ttfb: Math.random() * 1000 + 100,
      fcp: Math.random() * 3000 + 500,
      deviceType: ["mobile", "desktop", "tablet"][
        Math.floor(Math.random() * 3)
      ] as any,
      browserName: ["Chrome", "Firefox", "Safari", "Edge"][
        Math.floor(Math.random() * 4)
      ],
      osName: ["Windows", "macOS", "Linux", "iOS", "Android"][
        Math.floor(Math.random() * 5)
      ],
      pageUrl: "https://example.com/page",
      timestamp: new Date(now - i * 3600000).toISOString(), // Hourly data
    });
  }

  return metrics;
}

export function getMockMetrics(
  siteId: string,
  filters: MetricFilters
): Promise<{ metrics: Metric[]; summary: MetricSummary }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let metrics = generateMockMetrics(siteId, 100);

      // Apply filters
      if (filters.deviceType) {
        metrics = metrics.filter((m) => m.deviceType === filters.deviceType);
      }
      if (filters.browserName) {
        metrics = metrics.filter((m) => m.browserName === filters.browserName);
      }

      // Calculate summary
      const summary = calculateMetricSummary(metrics);

      resolve({ metrics, summary });
    }, 800);
  });
}

function calculateMetricSummary(metrics: Metric[]): MetricSummary {
  const lcpValues = metrics.map((m) => m.lcp || 0).sort((a, b) => a - b);
  const fidValues = metrics.map((m) => m.fid || 0).sort((a, b) => a - b);
  const clsValues = metrics.map((m) => m.cls || 0).sort((a, b) => a - b);

  return {
    avgLcp: average(lcpValues),
    avgFid: average(fidValues),
    avgCls: average(clsValues),
    p95Lcp: percentile(lcpValues, 95),
    p95Fid: percentile(fidValues, 95),
    p95Cls: percentile(clsValues, 95),
    count: metrics.length,
  };
}
```

### Metric Threshold Utilities

```typescript
// lib/utils/metrics.ts
export type MetricStatus = "good" | "needs-improvement" | "poor";

export interface MetricThresholds {
  good: number;
  poor: number;
}

export const METRIC_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 }, // milliseconds
  fid: { good: 100, poor: 300 }, // milliseconds
  cls: { good: 0.1, poor: 0.25 }, // score
  ttfb: { good: 800, poor: 1800 }, // milliseconds
  fcp: { good: 1800, poor: 3000 }, // milliseconds
} as const;

export function getMetricStatus(
  metricType: keyof typeof METRIC_THRESHOLDS,
  value: number
): MetricStatus {
  const thresholds = METRIC_THRESHOLDS[metricType];

  if (value <= thresholds.good) {
    return "good";
  } else if (value <= thresholds.poor) {
    return "needs-improvement";
  } else {
    return "poor";
  }
}

export function getMetricColor(status: MetricStatus): string {
  switch (status) {
    case "good":
      return "text-green-600 bg-green-100";
    case "needs-improvement":
      return "text-yellow-600 bg-yellow-100";
    case "poor":
      return "text-red-600 bg-red-100";
  }
}
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: TypeScript Strict Mode Compilation

_For any_ TypeScript file in the project, compiling with strict mode enabled should complete without type errors
**Validates: Requirements 1.2**

### Property 2: Dashboard Layout Consistency

_For any_ dashboard page, the sidebar navigation menu should be displayed on the left side and the header bar should be displayed at the top
**Validates: Requirements 4.1, 4.2**

### Property 3: Responsive Navigation Behavior

_For any_ viewport width less than 768 pixels, the sidebar should be hidden and the mobile navigation menu should be displayed
**Validates: Requirements 4.3, 6.1, 6.5**

### Property 4: Active Navigation Highlighting

_For any_ navigation link that is clicked, that link should be highlighted as the active page in the navigation menu
**Validates: Requirements 4.4**

### Property 5: Theme Toggle Functionality

_For any_ current theme state (light or dark), clicking the theme toggle button should switch to the opposite theme
**Validates: Requirements 5.1**

### Property 6: Theme Propagation

_For any_ theme change, all UI components should update to use the appropriate color scheme for the new theme
**Validates: Requirements 5.2**

### Property 7: Theme Persistence

_For any_ theme preference set by the user, the preference should be stored in browser localStorage
**Validates: Requirements 5.3**

### Property 8: Theme Restoration

_For any_ theme preference stored in localStorage, reloading the application should restore and apply that theme
**Validates: Requirements 5.4**

### Property 9: Theme Icon Representation

_For any_ current theme state, the theme toggle should display an icon that accurately represents that state
**Validates: Requirements 5.5**

### Property 10: Mobile Navigation Interaction

_For any_ closed mobile navigation drawer, tapping the hamburger icon should open the drawer
**Validates: Requirements 6.2**

### Property 11: Mobile Navigation Content

_For any_ open mobile navigation drawer, all navigation links should be displayed in a vertical list
**Validates: Requirements 6.3**

### Property 12: Mobile Navigation Dismissal

_For any_ open mobile navigation drawer, tapping outside the drawer should close it
**Validates: Requirements 6.4**

### Property 13: Site Card Display

_For any_ list of monitored sites, all sites should be rendered as cards in the dashboard grid
**Validates: Requirements 7.1**

### Property 14: Site Card Content Completeness

_For any_ site card, the card should display the site name, URL, and latest Core Web Vitals metrics (LCP, FID, CLS)
**Validates: Requirements 7.2**

### Property 15: Site Card Navigation

_For any_ site card that is clicked, the application should navigate to the detailed metrics page for that site
**Validates: Requirements 7.5**

### Property 16: Add Site Modal Opening

_For any_ closed "Add New Site" modal, clicking the "Add New Site" button should open the modal
**Validates: Requirements 8.2**

### Property 17: Add Site Modal Form Fields

_For any_ opened "Add New Site" modal, the modal should display a form with fields for site name and URL
**Validates: Requirements 8.3**

### Property 18: Add Site Form Submission

_For any_ valid site data submitted through the form, the modal should close and a success message should be displayed
**Validates: Requirements 8.4**

### Property 19: Modal Dismissal

_For any_ open modal, clicking outside the modal or pressing the escape key should close the modal without saving
**Validates: Requirements 8.5**

### Property 20: Site Details Header Information

_For any_ site details page, the page header should display the site name and URL
**Validates: Requirements 10.1**

### Property 21: Metric Summary Cards Presence

_For any_ site details page, metric summary cards for LCP, FID, and CLS should all be displayed
**Validates: Requirements 10.2**

### Property 22: Charts Presence

_For any_ site details page, time-series charts for each Core Web Vital (LCP, FID, CLS) should be displayed
**Validates: Requirements 10.3**

### Property 23: Chart Elements Completeness

_For any_ rendered chart, the chart should display axis labels, tooltips, and legends
**Validates: Requirements 11.5**

### Property 24: Metric Card Information

_For any_ metric card, the card should display the metric name and current value
**Validates: Requirements 12.1**

### Property 25: Good Metric Status Indicator

_For any_ metric value within good thresholds (LCP < 2500ms, FID < 100ms, CLS < 0.1), the status indicator should be green
**Validates: Requirements 12.2, 28.1, 28.4, 28.7**

### Property 26: Needs Improvement Metric Status Indicator

_For any_ metric value in the needs-improvement range (LCP 2500-4000ms, FID 100-300ms, CLS 0.1-0.25), the status indicator should be yellow
**Validates: Requirements 12.3, 28.2, 28.5, 28.8**

### Property 27: Poor Metric Status Indicator

_For any_ metric value in the poor range (LCP > 4000ms, FID > 300ms, CLS > 0.25), the status indicator should be red
**Validates: Requirements 12.4, 28.3, 28.6, 28.9**

### Property 28: Metric Trend Display

_For any_ metric card with trend data, the card should display a trend indicator showing if the metric is improving or degrading
**Validates: Requirements 12.5**

### Property 29: Time Range Chart Updates

_For any_ time range selection, all charts should update to display data for the selected period
**Validates: Requirements 13.2**

### Property 30: Time Range Selection Highlighting

_For any_ selected time range option, that option should be highlighted in the time range selector
**Validates: Requirements 13.3**

### Property 31: Time Range Summary Updates

_For any_ time range change, metric summary cards should update to reflect the selected period
**Validates: Requirements 13.4**

### Property 32: Device Type Filtering

_For any_ device type filter selection, charts should update to show only data from that device type
**Validates: Requirements 14.2**

### Property 33: Browser Filtering

_For any_ browser filter selection, charts should update to show only data from that browser
**Validates: Requirements 14.3**

### Property 34: Active Filter Badges

_For any_ applied filter, an active filter badge should be displayed showing the current selection
**Validates: Requirements 14.4**

### Property 35: Filter Clearing

_For any_ set of applied filters, clearing the filters should reset charts to display all data
**Validates: Requirements 14.5**

### Property 36: Desktop Responsive Layout

_For any_ viewport width greater than 1024 pixels, charts should be displayed in a multi-column grid layout
**Validates: Requirements 15.1**

### Property 37: Tablet Responsive Layout

_For any_ viewport width between 768 and 1024 pixels, charts should be displayed in a two-column layout
**Validates: Requirements 15.2**

### Property 38: Mobile Responsive Layout

_For any_ viewport width less than 768 pixels, charts should be displayed in a single-column layout
**Validates: Requirements 15.3**

### Property 39: No Horizontal Scrolling

_For any_ viewport size, content should reflow without causing horizontal scrolling
**Validates: Requirements 15.4**

### Property 40: Mock Data Generation

_For any_ application initialization, mock site data with realistic names and URLs should be generated
**Validates: Requirements 16.1**

### Property 41: Mock Metric Value Ranges

_For any_ generated mock Core Web Vitals metric, the value should be within realistic ranges (LCP: 1000-6000ms, FID: 50-450ms, CLS: 0-0.4)
**Validates: Requirements 16.2**

### Property 42: Time-Series Data Timestamps

_For any_ generated time-series data point, the data point should include a timestamp
**Validates: Requirements 16.3**

### Property 43: Mock Data Variety

_For any_ generated mock dataset, the dataset should include multiple device types and browsers
**Validates: Requirements 16.4**

### Property 44: Environment Variable Error Handling

_For any_ missing required environment variable, the application should provide a clear error message indicating which variable is required
**Validates: Requirements 17.4**

### Property 45: Loading State Skeletons

_For any_ data fetching operation in progress, skeleton loading components should be displayed matching the expected content layout
**Validates: Requirements 22.1**

### Property 46: Error State Display

_For any_ error that occurs during data fetching, an error message with a retry button should be displayed
**Validates: Requirements 22.2**

### Property 47: Error Boundary Fallback

_For any_ component runtime error, the error boundary should catch the error and display a fallback UI
**Validates: Requirements 22.3**

### Property 48: Extended Loading Indicator

_For any_ loading state that exceeds 3 seconds, a progress indicator or loading message should be displayed
**Validates: Requirements 22.4**

### Property 49: Error Logging

_For any_ error that is displayed to the user, error details should be logged to the console for debugging
**Validates: Requirements 22.5**

### Property 50: Form Validation Error Display

_For any_ invalid data entered in a form field, an error message should be displayed below the field
**Validates: Requirements 23.2**

### Property 51: Form Submission Prevention

_For any_ form with validation errors, submission should be prevented and all invalid fields should be highlighted
**Validates: Requirements 23.3**

### Property 52: URL Format Validation

_For any_ site URL input, validation should verify the URL format matches the pattern https?://[domain]
**Validates: Requirements 23.4**

### Property 53: Site Name Length Validation

_For any_ site name input, validation should require a minimum of 3 characters and maximum of 50 characters
**Validates: Requirements 23.5**

### Property 54: Authentication Token Storage

_For any_ successful login, the authentication token should be stored in localStorage
**Validates: Requirements 24.1**

### Property 55: Token Restoration on Initialization

_For any_ stored authentication token, the application should load and validate the token on initialization
**Validates: Requirements 24.2**

### Property 56: Token Expiration Handling

_For any_ expired authentication token, the user should be redirected to the login page
**Validates: Requirements 24.3**

### Property 57: Logout Token Clearing

_For any_ logout action, the authentication token should be cleared from both localStorage and Redux state
**Validates: Requirements 24.4**

### Property 58: Protected Route Authentication

_For any_ protected route accessed without authentication, the user should be redirected to the login page
**Validates: Requirements 24.5**

### Property 59: API Request Authentication Header

_For any_ authenticated API request, the authentication token should be automatically included in the Authorization header
**Validates: Requirements 25.2**

### Property 60: 401 Error Handling

_For any_ API request that fails with a 401 status, authentication state should be cleared and the user should be redirected to login
**Validates: Requirements 25.3**

### Property 61: Network Error Display

_For any_ API request that fails with a network error, a user-friendly error message should be displayed
**Validates: Requirements 25.4**

### Property 62: API Request Timeout

_For any_ API request that exceeds 10 seconds, a timeout error should occur and be handled appropriately
**Validates: Requirements 25.5**

### Property 63: Keyboard Accessibility

_For any_ interactive element (button or link), the element should be keyboard accessible with a visible focus indicator
**Validates: Requirements 26.1**

### Property 64: Image Alt Text

_For any_ image displayed in the application, the image should include descriptive alt text for screen readers
**Validates: Requirements 26.2**

### Property 65: Form Label Association

_For any_ form input, a label should be properly associated with the input using HTML semantics
**Validates: Requirements 26.3**

### Property 66: Non-Color Indicators

_For any_ information conveyed using color, additional non-color indicators should be provided for colorblind users
**Validates: Requirements 26.4**

### Property 67: Mock Data Type Conformance

_For any_ mock data type definition, the TypeScript interface should match the Prisma schema from the PRD
**Validates: Requirements 27.1**

### Property 68: Mock Site Data Completeness

_For any_ generated mock site, the site should include all required properties: id, name, url, domain, siteId, isActive, and timestamps
**Validates: Requirements 27.2**

### Property 69: Mock Metric Data Completeness

_For any_ generated mock metric, the metric should include all required properties: lcp, fid, cls, ttfb, fcp, deviceType, browserName, and timestamp
**Validates: Requirements 27.3**

## Error Handling

### Error Boundary Implementation

```typescript
// app/components/UI/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Skeleton Loading Components

```typescript
// app/components/UI/Skeleton.tsx
export function CardSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-6"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
      <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        </div>
      ))}
    </div>
  );
}
```

### API Error Handling

```typescript
// lib/api/client.ts
import axios, { AxiosError } from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/slices/userSlice";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
      window.location.href = "/auth/login";
    }

    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timeout - please try again"));
    }

    if (!error.response) {
      return Promise.reject(
        new Error("Network error - please check your connection")
      );
    }

    return Promise.reject(error);
  }
);
```

### Form Validation with Zod

```typescript
// lib/validations/schemas.ts
import { z } from "zod";

export const siteSchema = z.object({
  name: z
    .string()
    .min(3, "Site name must be at least 3 characters")
    .max(50, "Site name must be less than 50 characters"),
  url: z
    .string()
    .regex(/^https?:\/\/.+/, "URL must start with http:// or https://")
    .url("Please enter a valid URL"),
});

export type SiteFormData = z.infer<typeof siteSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;
```

## Testing Strategy

### Unit Testing Approach

**Framework:** Jest + React Testing Library

**Coverage Goals:**

- Component rendering: 80%+
- Utility functions: 90%+
- Redux slices: 85%+
- Overall: 75%+

**E2E Testing (Future - Week 4+):**

- Framework: Cypress or Playwright
- Critical user flows: Login, add site, view metrics, apply filters
- Cross-browser testing: Chrome, Firefox, Safari
- Mobile viewport testing
- Note: E2E tests will be added after MVP launch for regression testing

**Unit Test Examples:**

```typescript
// app/components/Dashboard/SiteCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SiteCard } from './SiteCard';

describe('SiteCard', () => {
  const mockSite = {
    id: 1,
    name: 'Test Site',
    url: 'https://test.com',
    siteId: 'site_123',
    lastMetric: { lcp: 2000, fid: 80, cls: 0.05 },
  };

  it('renders site name and URL', () => {
    render(<SiteCard site={mockSite} />);
    expect(screen.getByText('Test Site')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
  });

  it('displays metric values with correct status colors', () => {
    render(<SiteCard site={mockSite} />);
    const lcpBadge = screen.getByText('2000ms');
    expect(lcpBadge).toHaveClass('text-green-600');
  });

  it('calls onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<SiteCard site={mockSite} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

```typescript
// lib/utils/metrics.test.ts
import { getMetricStatus, METRIC_THRESHOLDS } from "./metrics";

describe("getMetricStatus", () => {
  describe("LCP metric", () => {
    it('returns "good" for values under 2500ms', () => {
      expect(getMetricStatus("lcp", 2000)).toBe("good");
      expect(getMetricStatus("lcp", 2500)).toBe("good");
    });

    it('returns "needs-improvement" for values between 2500-4000ms', () => {
      expect(getMetricStatus("lcp", 3000)).toBe("needs-improvement");
      expect(getMetricStatus("lcp", 4000)).toBe("needs-improvement");
    });

    it('returns "poor" for values over 4000ms', () => {
      expect(getMetricStatus("lcp", 4001)).toBe("poor");
      expect(getMetricStatus("lcp", 5000)).toBe("poor");
    });
  });
});
```

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Installation:**

```bash
npm install --save-dev fast-check
```

**Property Test Examples:**

```typescript
// lib/utils/metrics.property.test.ts
import * as fc from "fast-check";
import { getMetricStatus, METRIC_THRESHOLDS } from "./metrics";

describe("Metric Status Properties", () => {
  /**
   * Feature: frontend-dashboard, Property 25: Good Metric Status Indicator
   * For any metric value within good thresholds, the status should be "good"
   */
  it("property: LCP values under good threshold are classified as good", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: METRIC_THRESHOLDS.lcp.good }),
        (lcpValue) => {
          const status = getMetricStatus("lcp", lcpValue);
          return status === "good";
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: frontend-dashboard, Property 26: Needs Improvement Metric Status Indicator
   * For any metric value in needs-improvement range, the status should be "needs-improvement"
   */
  it("property: LCP values in needs-improvement range are classified correctly", () => {
    fc.assert(
      fc.property(
        fc.float({
          min: METRIC_THRESHOLDS.lcp.good + 0.01,
          max: METRIC_THRESHOLDS.lcp.poor,
        }),
        (lcpValue) => {
          const status = getMetricStatus("lcp", lcpValue);
          return status === "needs-improvement";
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: frontend-dashboard, Property 27: Poor Metric Status Indicator
   * For any metric value above poor threshold, the status should be "poor"
   */
  it("property: LCP values above poor threshold are classified as poor", () => {
    fc.assert(
      fc.property(
        fc.float({ min: METRIC_THRESHOLDS.lcp.poor + 0.01, max: 10000 }),
        (lcpValue) => {
          const status = getMetricStatus("lcp", lcpValue);
          return status === "poor";
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// lib/mock-data/mockMetrics.property.test.ts
import * as fc from "fast-check";
import { generateMockMetrics } from "./mockMetrics";

describe("Mock Data Generation Properties", () => {
  /**
   * Feature: frontend-dashboard, Property 41: Mock Metric Value Ranges
   * For any generated mock metric, values should be within realistic ranges
   */
  it("property: generated LCP values are within realistic range", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (count) => {
        const metrics = generateMockMetrics("1", count);
        return metrics.every(
          (m) => m.lcp !== undefined && m.lcp >= 1000 && m.lcp <= 6000
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: frontend-dashboard, Property 42: Time-Series Data Timestamps
   * For any generated time-series data, all points should have timestamps
   */
  it("property: all generated metrics have timestamps", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (count) => {
        const metrics = generateMockMetrics("1", count);
        return metrics.every(
          (m) => m.timestamp !== undefined && m.timestamp.length > 0
        );
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: frontend-dashboard, Property 43: Mock Data Variety
   * For any generated dataset, multiple device types should be present
   */
  it("property: generated metrics include varied device types", () => {
    fc.assert(
      fc.property(
        fc.constant(100), // Generate enough data to ensure variety
        (count) => {
          const metrics = generateMockMetrics("1", count);
          const deviceTypes = new Set(metrics.map((m) => m.deviceType));
          return deviceTypes.size > 1; // At least 2 different device types
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// lib/redux/slices/themeSlice.property.test.ts
import * as fc from "fast-check";
import themeReducer, { toggleTheme, setTheme } from "./themeSlice";

describe("Theme Slice Properties", () => {
  /**
   * Feature: frontend-dashboard, Property 5: Theme Toggle Functionality
   * For any theme state, toggling should switch to the opposite theme
   */
  it("property: toggling theme always switches to opposite", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        (initialMode) => {
          const initialState = { mode: initialMode };
          const newState = themeReducer(initialState, toggleTheme());
          const expectedMode = initialMode === "light" ? "dark" : "light";
          return newState.mode === expectedMode;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: frontend-dashboard, Property 5: Theme Toggle Idempotence
   * Toggling twice should return to original state
   */
  it("property: toggling theme twice returns to original state", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("light" as const, "dark" as const),
        (initialMode) => {
          const initialState = { mode: initialMode };
          const state1 = themeReducer(initialState, toggleTheme());
          const state2 = themeReducer(state1, toggleTheme());
          return state2.mode === initialMode;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Testing Configuration:**

Each property-based test is configured to run 100 iterations by default to ensure thorough coverage of the input space. Tests use fast-check's built-in arbitraries (fc.float, fc.integer, fc.constantFrom) to generate random test data within specified constraints.

## Data Flow Diagrams

### User Authentication Flow

```
┌─────────────┐
│ User enters │
│ credentials │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ LoginForm validates │
│ with Zod schema     │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│ API client sends     │
│ POST /api/auth/login │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐     ┌─────────────────┐
│ Response received    │────▶│ Store token in  │
│ with JWT token       │     │ localStorage    │
└──────┬───────────────┘     └─────────────────┘
       │
       ▼
┌──────────────────────┐
│ Dispatch setUser()   │
│ and setToken() to    │
│ Redux store          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Redirect to          │
│ /dashboard           │
└──────────────────────┘
```

### Dashboard Data Loading Flow

```
┌──────────────────┐
│ Dashboard page   │
│ component mounts │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ useSites() hook      │
│ triggers React Query │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Query checks cache   │
│ (stale time: 1 min)  │
└────────┬─────────────┘
         │
         ├─── Cache hit ───▶ Return cached data
         │
         └─── Cache miss
                │
                ▼
         ┌──────────────────────┐
         │ Call getMockSites()  │
         │ (Week 1: mock data)  │
         └────────┬─────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │ Simulate 500ms delay │
         └────────┬─────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │ Return mock sites    │
         │ array                │
         └────────┬─────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │ React Query caches   │
         │ result               │
         └────────┬─────────────┘
                  │
                  ▼
         ┌──────────────────────┐
         │ Component re-renders │
         │ with site data       │
         └──────────────────────┘
```

### Site Details Filtering Flow

```
┌──────────────────────┐
│ User selects device  │
│ type filter: "mobile"│
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Update local state   │
│ filters = {          │
│   deviceType: mobile │
│ }                    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ useMetrics() hook    │
│ detects filter change│
│ (query key changed)  │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Call getMockMetrics  │
│ with filters         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Filter metrics array │
│ where deviceType     │
│ === "mobile"         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Calculate summary    │
│ stats for filtered   │
│ data                 │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Return filtered      │
│ metrics + summary    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Charts re-render     │
│ with filtered data   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Display active       │
│ filter badge         │
└──────────────────────┘
```

### Theme Toggle Flow

```
┌──────────────────────┐
│ User clicks theme    │
│ toggle button        │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Dispatch toggleTheme │
│ action to Redux      │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Theme reducer        │
│ switches mode:       │
│ light ↔ dark         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Redux middleware     │
│ saves to localStorage│
│ key: "theme"         │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ All components       │
│ subscribed to theme  │
│ selector re-render   │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Root layout applies  │
│ dark/light class to  │
│ <html> element       │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│ Tailwind CSS applies │
│ theme-specific styles│
└──────────────────────┘
```

## Accessibility Implementation

### Focus Management

**Keyboard Navigation Order:**

1. Skip to main content link (hidden, visible on focus)
2. Header navigation
3. Sidebar navigation links
4. Main content area
5. Interactive elements (buttons, links, form inputs)
6. Footer (if present)

**Focus Indicators:**

```css
/* Tailwind CSS focus styles */
.focus-visible:focus {
  @apply ring-2 ring-blue-500 ring-offset-2 outline-none;
}

/* Custom focus styles for specific components */
button:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

a:focus-visible {
  @apply ring-2 ring-blue-500 ring-offset-2 rounded;
}
```

### ARIA Labels and Roles

```typescript
// Example: Site Card with proper ARIA
<article
  role="article"
  aria-labelledby={`site-name-${site.id}`}
  onClick={handleClick}
  className="site-card"
>
  <h3 id={`site-name-${site.id}`}>{site.name}</h3>
  <p aria-label="Site URL">{site.url}</p>

  <div role="group" aria-label="Core Web Vitals metrics">
    <div aria-label={`LCP: ${site.lastMetric.lcp} milliseconds, ${getMetricStatus('lcp', site.lastMetric.lcp)}`}>
      <span aria-hidden="true">LCP: {site.lastMetric.lcp}ms</span>
    </div>
  </div>
</article>

// Example: Modal with proper ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Add New Site</h2>
  <p id="modal-description">Enter the details for the site you want to monitor</p>

  <form>
    <label htmlFor="site-name">Site Name</label>
    <input
      id="site-name"
      type="text"
      aria-required="true"
      aria-invalid={errors.name ? 'true' : 'false'}
      aria-describedby={errors.name ? 'name-error' : undefined}
    />
    {errors.name && (
      <span id="name-error" role="alert">{errors.name.message}</span>
    )}
  </form>
</div>

// Example: Chart with accessible description
<div role="img" aria-label="Line chart showing LCP values over the last 24 hours">
  <LineChart data={data}>
    {/* Chart content */}
  </LineChart>
  <div className="sr-only">
    Average LCP: {avgLcp}ms, ranging from {minLcp}ms to {maxLcp}ms
  </div>
</div>
```

### Screen Reader Support

**Semantic HTML Structure:**

```html
<body>
  <a href="#main-content" class="sr-only focus:not-sr-only">
    Skip to main content
  </a>

  <header role="banner">
    <nav aria-label="Main navigation">
      <!-- Navigation links -->
    </nav>
  </header>

  <aside aria-label="Sidebar navigation">
    <!-- Sidebar content -->
  </aside>

  <main id="main-content" role="main">
    <!-- Page content -->
  </main>

  <footer role="contentinfo">
    <!-- Footer content -->
  </footer>
</body>
```

**Live Regions for Dynamic Content:**

```typescript
// Announce loading states
<div role="status" aria-live="polite" aria-atomic="true">
  {isLoading && <span>Loading site data...</span>}
</div>

// Announce errors
<div role="alert" aria-live="assertive" aria-atomic="true">
  {error && <span>{error.message}</span>}
</div>

// Announce success messages
<div role="status" aria-live="polite">
  {successMessage && <span>{successMessage}</span>}
</div>
```

### Color Contrast and Visual Indicators

**WCAG AA Compliance:**

- Normal text: 4.5:1 contrast ratio minimum
- Large text (18pt+): 3:1 contrast ratio minimum
- UI components: 3:1 contrast ratio minimum

**Non-Color Indicators:**

```typescript
// Metric status with icon + color + text
<div className={`metric-badge ${getMetricColor(status)}`}>
  {status === 'good' && <CheckIcon aria-hidden="true" />}
  {status === 'needs-improvement' && <WarningIcon aria-hidden="true" />}
  {status === 'poor' && <ErrorIcon aria-hidden="true" />}
  <span>{value}ms</span>
  <span className="sr-only">
    Status: {status === 'good' ? 'Good' : status === 'needs-improvement' ? 'Needs Improvement' : 'Poor'}
  </span>
</div>
```

## Performance Optimization

### Code Splitting Strategy

```typescript
// app/dashboard/[siteId]/page.tsx
import dynamic from 'next/dynamic';

// Lazy load chart components
const LCPChart = dynamic(() => import('@/components/Charts/LCPChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false, // Charts don't need SSR
});

const FIDChart = dynamic(() => import('@/components/Charts/FIDChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const CLSChart = dynamic(() => import('@/components/Charts/CLSChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});
```

### React Performance Optimizations

```typescript
// Memoize expensive computations
import { useMemo } from 'react';

function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  const summary = useMemo(() => {
    return calculateMetricSummary(metrics);
  }, [metrics]);

  return <div>{/* Render summary */}</div>;
}

// Memoize components that don't need frequent re-renders
import { memo } from 'react';

export const SiteCard = memo(function SiteCard({ site, onClick }: SiteCardProps) {
  return <article>{/* Card content */}</article>;
});

// Debounce resize events for charts
import { useEffect, useState } from 'react';
import { debounce } from 'lodash-es';

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = debounce(() => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }, 250);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
```

### Bundle Size Optimization

**Next.js Configuration:**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Analyze bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk for shared code
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
```

## Integration Points for Week 3

### API Client Ready State

The frontend is designed to seamlessly integrate with the backend API in Week 3 by simply updating the data fetching functions. The mock data structure exactly matches the expected API response format.

**Current (Week 1) - Mock Data:**

```typescript
// lib/react-query/queries/useSites.ts
export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => {
      return getMockSites(); // Returns Promise<Site[]>
    },
  });
}
```

**Future (Week 3) - Real API:**

```typescript
// lib/react-query/queries/useSites.ts
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

### Environment Variables for API Integration

```bash
# .env.example
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=true  # Set to false in Week 3

# AWS Configuration (for Week 4)
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID=
```

### WebSocket Integration Preparation

```typescript
// lib/websocket/client.ts (to be implemented in Week 4)
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initializeWebSocket(token: string) {
  socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("WebSocket connected");
  });

  socket.on("metric:received", (data) => {
    // Invalidate React Query cache to trigger refetch
    queryClient.invalidateQueries({ queryKey: ["metrics"] });
  });

  return socket;
}

export function subscribeToSite(siteId: string) {
  socket?.emit("subscribe:site", siteId);
}

export function unsubscribeFromSite(siteId: string) {
  socket?.emit("unsubscribe:site", siteId);
}
```

## Deployment Configuration

### Environment-Specific Builds

**Development:**

```bash
npm run dev
# Runs on http://localhost:3000
# Hot reload enabled
# Source maps enabled
# Mock data enabled
```

**Production:**

```bash
npm run build
npm run start
# Optimized build
# Source maps disabled
# Mock data disabled (uses real API)
```

### Build Output Structure

```
.next/
├── static/
│   ├── chunks/          # Code-split chunks
│   ├── css/             # Compiled CSS
│   └── media/           # Optimized images
├── server/
│   ├── app/             # Server-rendered pages
│   └── pages/           # API routes (if any)
└── cache/               # Build cache
```

### Performance Targets

**Lighthouse Scores (Production Build):**

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

**Core Web Vitals:**

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Bundle Sizes:**

- Initial page load: < 150KB (gzipped)
- Total JavaScript: < 300KB (gzipped)
- CSS: < 50KB (gzipped)

## Summary

This design document provides a comprehensive blueprint for implementing the Week 1 Frontend Dashboard. The architecture is modular, type-safe, and designed for seamless integration with the backend API in Week 3. All components follow accessibility best practices, and the state management is structured for scalability.

Key design decisions:

1. **Redux Toolkit** for client state (theme, user, UI)
2. **React Query** for server state (sites, metrics, alerts)
3. **Zod** for form validation
4. **fast-check** for property-based testing
5. **Mock data** structured to match future API responses exactly
6. **Accessibility-first** approach with WCAG 2.1 AA compliance
7. **Performance-optimized** with code splitting and lazy loading

The implementation can proceed directly from this design, with all interfaces, data structures, and component specifications clearly defined.
