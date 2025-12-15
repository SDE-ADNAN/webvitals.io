# Library Documentation

This directory contains the core utilities, mock data, state management, and validation logic for the WebVitals.io frontend dashboard.

## Directory Structure

```
lib/
├── config/           # Environment configuration
├── mock-data/        # Mock data generators and types
├── react-query/      # React Query configuration
├── redux/            # Redux store and slices
├── utils/            # Utility functions
└── validations/      # Form validation schemas
```

## Mock Data (`lib/mock-data/`)

Mock data generators for development and testing before backend integration.

### Files

- **`types.ts`** - TypeScript type definitions for mock data
- **`mockSites.ts`** - Sample site data and retrieval functions
- **`mockMetrics.ts`** - Metric generation and filtering functions
- **`mockMetrics.property.test.ts`** - Property-based tests for mock data

### Usage

```typescript
import { getMockSites, getMockSite } from "@/lib/mock-data/mockSites";
import { generateMockMetrics, getMockMetrics } from "@/lib/mock-data/mockMetrics";

// Get all sites (with simulated 500ms delay)
const sites = await getMockSites();

// Get a specific site by siteId (with simulated 300ms delay)
const site = await getMockSite("site_abc123");

// Generate metrics for a site
const metrics = generateMockMetrics("1", 100);

// Get metrics with filters (with simulated 800ms delay)
const { metrics, summary } = await getMockMetrics("1", {
  deviceType: "mobile",
  timeRange: "24h",
  browserName: "Chrome",
});
```

### Mock Data Characteristics

**Sites:**
- 3 pre-configured sites with realistic data
- Includes: id, userId, name, url, domain, siteId, isActive, timestamps

**Metrics:**
- Realistic Core Web Vitals ranges:
  - LCP: 1000-6000ms
  - FID: 50-450ms
  - CLS: 0-0.4
  - TTFB: 100-1100ms
  - FCP: 500-3500ms
- Varied device types: mobile, desktop, tablet
- Multiple browsers: Chrome, Firefox, Safari, Edge
- Multiple OS: Windows, macOS, Linux, iOS, Android
- Time-series data with hourly timestamps

## Utilities (`lib/utils/`)

### Metrics Utilities (`metrics.ts`)

Functions for classifying and displaying Core Web Vitals metrics.

```typescript
import {
  getMetricStatus,
  getMetricColor,
  getMetricStatusLabel,
  METRIC_THRESHOLDS,
} from "@/lib/utils/metrics";

// Classify a metric value
const status = getMetricStatus("lcp", 2500); // "good" | "needs-improvement" | "poor"

// Get Tailwind CSS classes for status
const colorClasses = getMetricColor("good"); // "text-green-600 bg-green-100 ..."

// Get human-readable label
const label = getMetricStatusLabel("good"); // "Good"

// Access thresholds
console.log(METRIC_THRESHOLDS.lcp); // { good: 2500, poor: 4000 }
```

**Thresholds (based on Google's Core Web Vitals standards):**
- LCP: ≤2500ms (good), ≤4000ms (needs improvement), >4000ms (poor)
- FID: ≤100ms (good), ≤300ms (needs improvement), >300ms (poor)
- CLS: ≤0.1 (good), ≤0.25 (needs improvement), >0.25 (poor)
- TTFB: ≤800ms (good), ≤1800ms (needs improvement), >1800ms (poor)
- FCP: ≤1800ms (good), ≤3000ms (needs improvement), >3000ms (poor)

### Formatters (`formatters.ts`)

Functions for formatting values for display.

```typescript
import {
  formatMetricValue,
  formatTimestamp,
  formatRelativeTime,
  formatDuration,
  formatNumber,
  formatPercentage,
} from "@/lib/utils/formatters";

// Format metric values
formatMetricValue(2543.789, "ms"); // "2543.79ms"
formatMetricValue(0.123, ""); // "0.123"

// Format timestamps
formatTimestamp(new Date()); // "Dec 15, 2025 11:24 AM"
formatTimestamp(date, "yyyy-MM-dd"); // "2025-12-15"
formatRelativeTime(date); // "2 hours ago"

// Format durations
formatDuration(65000); // "1m 5s"
formatDuration(3665000); // "1h 1m"
formatDuration(90000000); // "1d 1h"

// Format numbers and percentages
formatNumber(1234567); // "1,234,567"
formatPercentage(0.75); // "75.0%"
formatPercentage(0.123, 2); // "12.30%"
```

## Validations (`lib/validations/`)

Zod schemas for form validation.

### Schemas

```typescript
import {
  siteSchema,
  loginSchema,
  signupSchema,
  alertSchema,
  profileSchema,
  type SiteFormData,
  type LoginFormData,
  type SignupFormData,
} from "@/lib/validations/schemas";

// Site form validation
const result = siteSchema.safeParse({
  name: "My Site",
  url: "https://example.com",
});

if (result.success) {
  const data: SiteFormData = result.data;
}

// Use with react-hook-form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm<SiteFormData>({
  resolver: zodResolver(siteSchema),
});
```

**Available Schemas:**

1. **`siteSchema`** - Site creation/editing
   - name: 3-50 characters
   - url: Valid URL starting with http:// or https://

2. **`loginSchema`** - User login
   - email: Valid email address
   - password: Minimum 8 characters

3. **`signupSchema`** - User registration
   - email: Valid email address
   - password: Min 8 chars, must contain uppercase, lowercase, and number
   - confirmPassword: Must match password

4. **`alertSchema`** - Alert configuration
   - siteId: Positive number
   - metricType: One of "lcp", "fid", "cls", "ttfb", "fcp"
   - threshold: Positive number
   - enabled: Boolean

5. **`profileSchema`** - User profile updates
   - firstName: Optional, 1-50 characters
   - lastName: Optional, 1-50 characters
   - email: Valid email address

## Testing

### Property-Based Tests

Property-based tests ensure correctness across a wide range of inputs using fast-check.

**Run all tests:**
```bash
npm test
```

**Run specific test files:**
```bash
npm test -- lib/mock-data/mockMetrics.property.test.ts
npm test -- lib/utils/metrics.property.test.ts
```

**Test Coverage:**

1. **Mock Data Generation** (12 tests)
   - Property 41: Mock Metric Value Ranges
   - Property 42: Time-Series Data Timestamps
   - Property 43: Mock Data Variety

2. **Metric Classification** (18 tests)
   - Property 25: Good Metric Status Indicator
   - Property 26: Needs Improvement Metric Status Indicator
   - Property 27: Poor Metric Status Indicator

### Manual Testing

Test scripts are available in `apps/web/scripts/`:

```bash
# Test mock data functions
npx tsx scripts/test-mock-data.ts

# Test utility functions
npx tsx scripts/test-utilities.ts
```

## Integration with Backend (Week 3)

The mock data structure exactly matches the expected API response format. To integrate with the real backend:

1. Update React Query hooks in `lib/react-query/queries/`
2. Replace `getMockSites()` with `apiClient.get('/sites')`
3. Replace `getMockMetrics()` with `apiClient.get('/metrics')`
4. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` in environment variables

Example:
```typescript
// Before (Week 1 - Mock Data)
export function useSites() {
  return useQuery({
    queryKey: ["sites"],
    queryFn: async () => getMockSites(),
  });
}

// After (Week 3 - Real API)
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

1. **Type Safety**: All functions are fully typed with TypeScript
2. **Validation**: Use Zod schemas for all form inputs
3. **Testing**: Property-based tests ensure correctness across many inputs
4. **Consistency**: Mock data matches production API structure exactly
5. **Performance**: Mock data includes realistic delays to simulate network latency

## Requirements Validated

This implementation validates the following requirements:

- **16.1-16.4**: Mock data generation with realistic values
- **12.1-12.5**: Metric classification and display
- **23.1-23.5**: Form validation schemas
- **27.1-27.4**: Type definitions matching Prisma schema
- **28.1-28.9**: Metric threshold definitions

All requirements are validated through property-based tests running 100 iterations each.
