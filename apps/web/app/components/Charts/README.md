# Chart Components

This directory contains chart components for visualizing Core Web Vitals metrics.

## Components

### ChartContainer
A wrapper component that provides consistent styling for all charts.

**Props:**
- `title` (string, required): The chart title
- `description` (string, optional): Optional description text
- `children` (ReactNode, required): The chart content
- `className` (string, optional): Additional CSS classes

**Example:**
```tsx
import { ChartContainer, LCPChart } from '@/app/components/Charts';

<ChartContainer 
  title="Largest Contentful Paint" 
  description="LCP measures loading performance"
>
  <LCPChart data={lcpData} timeRange="24h" />
</ChartContainer>
```

### LCPChart
Line chart displaying Largest Contentful Paint (LCP) values over time.

**Props:**
- `data` (Array, required): Array of objects with `timestamp` and `lcp` properties
- `timeRange` ('24h' | '7d' | '30d', optional): Time range for x-axis formatting (default: '24h')

**Features:**
- Threshold lines at 2500ms (good) and 4000ms (poor)
- Responsive sizing
- Accessible with ARIA labels and screen reader text
- Tooltip showing exact values

**Example:**
```tsx
import { LCPChart } from '@/app/components/Charts';

const data = [
  { timestamp: '2025-12-17T10:00:00Z', lcp: 2000 },
  { timestamp: '2025-12-17T11:00:00Z', lcp: 3000 },
];

<LCPChart data={data} timeRange="24h" />
```

### FIDChart
Bar chart displaying First Input Delay (FID) values over time.

**Props:**
- `data` (Array, required): Array of objects with `timestamp` and `fid` properties
- `timeRange` ('24h' | '7d' | '30d', optional): Time range for x-axis formatting (default: '24h')

**Features:**
- Threshold lines at 100ms (good) and 300ms (poor)
- Responsive sizing
- Accessible with ARIA labels and screen reader text
- Tooltip showing exact values

**Example:**
```tsx
import { FIDChart } from '@/app/components/Charts';

const data = [
  { timestamp: '2025-12-17T10:00:00Z', fid: 80 },
  { timestamp: '2025-12-17T11:00:00Z', fid: 150 },
];

<FIDChart data={data} timeRange="7d" />
```

### CLSChart
Area chart displaying Cumulative Layout Shift (CLS) scores over time.

**Props:**
- `data` (Array, required): Array of objects with `timestamp` and `cls` properties
- `timeRange` ('24h' | '7d' | '30d', optional): Time range for x-axis formatting (default: '24h')

**Features:**
- Threshold lines at 0.1 (good) and 0.25 (poor)
- Gradient fill for visual appeal
- Responsive sizing
- Accessible with ARIA labels and screen reader text
- Tooltip showing exact values (3 decimal places)

**Example:**
```tsx
import { CLSChart } from '@/app/components/Charts';

const data = [
  { timestamp: '2025-12-17T10:00:00Z', cls: 0.05 },
  { timestamp: '2025-12-17T11:00:00Z', cls: 0.15 },
];

<CLSChart data={data} timeRange="30d" />
```

## Accessibility

All chart components follow WCAG 2.1 AA accessibility standards:

- **role="img"**: Charts are marked with the img role for screen readers
- **aria-label**: Descriptive labels include chart type, metric name, and summary statistics
- **sr-only text**: Hidden text provides detailed information for screen readers, including:
  - Chart description
  - Average, minimum, and maximum values
  - Threshold information
- **Descriptive titles**: All charts have clear, descriptive titles

## Testing

All components have comprehensive test coverage:

- Unit tests for rendering and props
- Accessibility tests for ARIA attributes and screen reader support
- Tests for different time ranges
- Tests for empty data handling

Run tests:
```bash
npm test -- app/components/Charts/
```

## Dependencies

- **recharts**: Chart library for React
- **date-fns**: Date formatting utilities
- **@/lib/utils/metrics**: Metric threshold constants

## Requirements Validated

- **Requirement 11.1**: LCP chart with line visualization
- **Requirement 11.2**: FID chart with bar visualization
- **Requirement 11.3**: CLS chart with area visualization
- **Requirement 11.5**: Consistent chart styling and responsive sizing
- **Requirement 26.2**: Accessibility with ARIA labels
- **Requirement 26.4**: Screen reader support with descriptive text
