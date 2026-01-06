/**
 * Example usage of SiteDetails components
 * This file demonstrates how to use the components together
 * DO NOT import this file in production code - it's for reference only
 */

import { SiteHeader } from './SiteHeader';
import { MetricsGrid } from './MetricsGrid';

export function SiteDetailsExample() {
  // Example data structure
  const siteData = {
    name: 'My Portfolio',
    url: 'https://myportfolio.com',
  };

  const metricsData = {
    lcp: {
      value: 2000, // Good: < 2500ms
      trend: 'down' as const, // Improving
      trendValue: 10.5, // 10.5% improvement
    },
    fid: {
      value: 150, // Needs improvement: 100-300ms
      trend: 'stable' as const,
      trendValue: 0,
    },
    cls: {
      value: 0.15, // Needs improvement: 0.1-0.25
      trend: 'up' as const, // Getting worse
      trendValue: 5.2, // 5.2% worse
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Site Header with back button and site info */}
      <SiteHeader siteName={siteData.name} siteUrl={siteData.url} />

      {/* Metrics Grid showing all three Core Web Vitals */}
      <MetricsGrid
        lcp={metricsData.lcp}
        fid={metricsData.fid}
        cls={metricsData.cls}
      />

      {/* Additional content would go here:
       * - Time range selector
       * - Filter bar
       * - Charts (LCP, FID, CLS)
       */}
    </div>
  );
}

/**
 * Expected visual output:
 * 
 * ← Back to Dashboard
 * 
 * My Portfolio
 * https://myportfolio.com ↗
 * 
 * ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
 * │ LCP             │  │ FID             │  │ CLS             │
 * │ Largest...      │  │ First Input...  │  │ Cumulative...   │
 * │                 │  │                 │  │                 │
 * │ 2000ms  ↓10.5%  │  │ 150ms           │  │ 0.150  ↑5.2%    │
 * │                 │  │                 │  │                 │
 * │ Good: ≤ 2500ms  │  │ Good: ≤ 100ms   │  │ Good: ≤ 0.1     │
 * │ Needs: 2501-... │  │ Needs: 101-...  │  │ Needs: 0.11-... │
 * │ Poor: > 4000ms  │  │ Poor: > 300ms   │  │ Poor: > 0.25    │
 * └─────────────────┘  └─────────────────┘  └─────────────────┘
 *     [Green Badge]      [Yellow Badge]       [Yellow Badge]
 */
