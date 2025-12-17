import React from 'react';
import { MetricCard } from './MetricCard';

export interface MetricsGridProps {
  lcp: {
    value: number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
  };
  fid: {
    value: number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
  };
  cls: {
    value: number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
  };
}

export function MetricsGrid({ lcp, fid, cls }: MetricsGridProps) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      role="region"
      aria-label="Core Web Vitals metrics"
    >
      <MetricCard
        metricName="LCP"
        value={lcp.value}
        trend={lcp.trend}
        trendValue={lcp.trendValue}
      />
      <MetricCard
        metricName="FID"
        value={fid.value}
        trend={fid.trend}
        trendValue={fid.trendValue}
      />
      <MetricCard
        metricName="CLS"
        value={cls.value}
        trend={cls.trend}
        trendValue={cls.trendValue}
      />
    </div>
  );
}
