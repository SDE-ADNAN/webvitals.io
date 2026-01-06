# SiteDetails Components

This directory contains components for displaying detailed site performance metrics.

## Components

### MetricCard

Displays a single Core Web Vitals metric with:
- Metric name and full description
- Current value with appropriate unit
- Color-coded status badge (good/needs-improvement/poor)
- Trend indicator (up/down arrow) with percentage change
- Threshold information tooltip

**Props:**
- `metricName`: 'LCP' | 'FID' | 'CLS'
- `value`: number
- `trend?`: 'up' | 'down' | 'stable'
- `trendValue?`: number (percentage)

**Example:**
```tsx
<MetricCard 
  metricName="LCP" 
  value={2000} 
  trend="down" 
  trendValue={10.5} 
/>
```

### MetricsGrid

Displays all three Core Web Vitals metrics in a responsive grid layout.

**Props:**
- `lcp`: { value, trend?, trendValue? }
- `fid`: { value, trend?, trendValue? }
- `cls`: { value, trend?, trendValue? }

**Example:**
```tsx
<MetricsGrid
  lcp={{ value: 2000, trend: 'down', trendValue: 10 }}
  fid={{ value: 80, trend: 'stable' }}
  cls={{ value: 0.05, trend: 'up', trendValue: 5 }}
/>
```

### SiteHeader

Displays site information with navigation.

**Props:**
- `siteName`: string
- `siteUrl`: string

**Features:**
- Back button to dashboard
- Site name as h1
- Site URL as external link (opens in new tab)
- Proper accessibility attributes

**Example:**
```tsx
<SiteHeader 
  siteName="My Portfolio" 
  siteUrl="https://myportfolio.com" 
/>
```

## Testing

All components have comprehensive unit tests covering:
- Rendering and display
- Status badge colors for different thresholds
- Trend indicators
- Accessibility (ARIA labels, keyboard navigation)
- Responsive layout

Run tests:
```bash
npm test -- app/components/SiteDetails
```

## Accessibility

All components follow WCAG 2.1 AA standards:
- Proper semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Screen reader support
- Color contrast compliance
- Non-color indicators for status

## Requirements Validated

- **12.1**: Metric card displays name and current value
- **12.2**: Green status indicator for good metrics
- **12.3**: Yellow status indicator for needs-improvement metrics
- **12.4**: Red status indicator for poor metrics
- **12.5**: Trend indicator showing improvement/degradation
- **10.1**: Site header displays name and URL
- **10.2**: Metrics grid displays all three Core Web Vitals
