'use client';

/**
 * Site Details Page
 * 
 * Displays detailed performance metrics for a specific site including:
 * - Site header with name and URL
 * - Metric summary cards (LCP, FID, CLS)
 * - Time range selector (24h, 7d, 30d)
 * - Filter bar (device type, browser)
 * - Charts for each Core Web Vital
 */

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useSite } from '@/lib/react-query/queries/useSites';
import { useMetrics } from '@/lib/react-query/queries/useMetrics';
import {
  SiteHeader,
  MetricsGrid,
  TimeRangeSelector,
  FilterBar,
  type TimeRange,
} from '@/app/components/SiteDetails';
import { ChartSkeleton } from '@/app/components/UI/Skeleton';
import type { MetricFilters } from '@webvitals/types';

// Dynamic imports for chart components to reduce initial bundle size
const LCPChart = dynamic(() => import('@/app/components/Charts/LCPChart').then(mod => ({ default: mod.LCPChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const FIDChart = dynamic(() => import('@/app/components/Charts/FIDChart').then(mod => ({ default: mod.FIDChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

const CLSChart = dynamic(() => import('@/app/components/Charts/CLSChart').then(mod => ({ default: mod.CLSChart })), {
  loading: () => <ChartSkeleton />,
  ssr: false,
});

export default function SiteDetailsPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  // Filter state
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop' | 'tablet' | 'all'>('all');
  const [browserName, setBrowserName] = useState<string>('all');

  // Build filters object
  const filters: MetricFilters = {
    timeRange,
    ...(deviceType !== 'all' && { deviceType }),
    ...(browserName !== 'all' && { browserName }),
  };

  // Fetch site and metrics data
  const { data: site, isLoading: isSiteLoading, error: siteError } = useSite(siteId);
  const { data: metricsData, isLoading: isMetricsLoading, error: metricsError } = useMetrics(siteId, filters);

  // Prepare chart data with memoization to avoid expensive recomputations
  // Must be called before any conditional returns to follow Rules of Hooks
  const metrics = useMemo(() => metricsData?.metrics || [], [metricsData?.metrics]);
  const summary = metricsData?.summary;

  const lcpData = useMemo(() => 
    metrics
      .filter((m) => m.lcp !== undefined)
      .map((m) => ({ timestamp: m.timestamp, lcp: m.lcp! })),
    [metrics]
  );

  const fidData = useMemo(() => 
    metrics
      .filter((m) => m.fid !== undefined)
      .map((m) => ({ timestamp: m.timestamp, fid: m.fid! })),
    [metrics]
  );

  const clsData = useMemo(() => 
    metrics
      .filter((m) => m.cls !== undefined)
      .map((m) => ({ timestamp: m.timestamp, cls: m.cls! })),
    [metrics]
  );

  // Handle clear filters
  const handleClearFilters = () => {
    setDeviceType('all');
    setBrowserName('all');
  };

  // Loading state
  if (isSiteLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  // Error state
  if (siteError || !site) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-600 dark:text-red-400 text-lg font-semibold">
          Error loading site
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {siteError?.message || 'Site not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Site Header */}
      <SiteHeader siteName={site.name} siteUrl={site.url} />

      {/* Metrics Summary Cards */}
      {summary && (
        <MetricsGrid
          lcp={{ value: summary.avgLcp }}
          fid={{ value: summary.avgFid }}
          cls={{ value: summary.avgCls }}
        />
      )}

      {/* Filters Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <TimeRangeSelector selected={timeRange} onChange={setTimeRange} />
        <FilterBar
          deviceType={deviceType}
          browserName={browserName}
          onDeviceTypeChange={setDeviceType}
          onBrowserChange={setBrowserName}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Charts Section */}
      {isMetricsLoading ? (
        <div className="space-y-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      ) : metricsError ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold">
            Error loading metrics
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {metricsError.message}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* LCP Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Largest Contentful Paint (LCP)
            </h2>
            {lcpData.length > 0 ? (
              <LCPChart data={lcpData} timeRange={timeRange} />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                No LCP data available for the selected filters
              </div>
            )}
          </div>

          {/* FID Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              First Input Delay (FID)
            </h2>
            {fidData.length > 0 ? (
              <FIDChart data={fidData} timeRange={timeRange} />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                No FID data available for the selected filters
              </div>
            )}
          </div>

          {/* CLS Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Cumulative Layout Shift (CLS)
            </h2>
            {clsData.length > 0 ? (
              <CLSChart data={clsData} timeRange={timeRange} />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-500 dark:text-gray-400">
                No CLS data available for the selected filters
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
