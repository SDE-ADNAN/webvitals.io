'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../UI/Card';
import { Badge } from '../UI/Badge';
import { getMetricStatus, getMetricStatusLabel } from '@/lib/utils/metrics';
import type { Site } from '@webvitals/types';

export interface SiteCardProps {
  site: Site & {
    lastMetric?: {
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  onClick?: () => void;
}

/**
 * SiteCard component displays a summary of a monitored site
 * Shows site name, URL, and latest Core Web Vitals metrics with color-coded badges
 * 
 * Memoized to prevent unnecessary re-renders when parent component updates
 */
export const SiteCard = React.memo(function SiteCard({ site, onClick }: SiteCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior: navigate to site details page
      router.push(`/dashboard/${site.siteId}`);
    }
  };

  return (
    <Card
      as="article"
      onClick={handleClick}
      hover
      aria-labelledby={`site-name-${site.id}`}
      aria-describedby={`site-url-${site.id}`}
    >
      <div className="space-y-4">
        {/* Site Name */}
        <div>
          <h3
            id={`site-name-${site.id}`}
            className="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {site.name}
          </h3>
          <p
            id={`site-url-${site.id}`}
            className="text-sm text-gray-600 dark:text-gray-400 mt-1"
            aria-label="Site URL"
          >
            {site.url}
          </p>
        </div>

        {/* Site ID */}
        <div className="text-xs text-gray-500 dark:text-gray-500">
          ID: {site.siteId}
        </div>

        {/* Core Web Vitals Metrics */}
        {site.lastMetric && (
          <div
            role="group"
            aria-label="Core Web Vitals metrics"
            className="flex flex-wrap gap-2"
          >
            {/* LCP Badge */}
            <MetricBadge
              label="LCP"
              value={site.lastMetric.lcp}
              unit="ms"
              metricType="lcp"
            />

            {/* FID Badge */}
            <MetricBadge
              label="FID"
              value={site.lastMetric.fid}
              unit="ms"
              metricType="fid"
            />

            {/* CLS Badge */}
            <MetricBadge
              label="CLS"
              value={site.lastMetric.cls}
              unit=""
              metricType="cls"
            />
          </div>
        )}

        {/* No metrics available */}
        {!site.lastMetric && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No metrics available yet
          </p>
        )}
      </div>
    </Card>
  );
});

/**
 * MetricBadge component displays a single metric with color-coded status
 */
interface MetricBadgeProps {
  label: string;
  value: number;
  unit: string;
  metricType: 'lcp' | 'fid' | 'cls';
}

function MetricBadge({ label, value, unit, metricType }: MetricBadgeProps) {
  const status = getMetricStatus(metricType, value);
  const statusLabel = getMetricStatusLabel(status);

  // Format value based on metric type
  const formattedValue = metricType === 'cls' 
    ? value.toFixed(3) 
    : Math.round(value);

  // Map status to badge variant
  const badgeVariant = status === 'good' 
    ? 'green' 
    : status === 'needs-improvement' 
    ? 'yellow' 
    : 'red';

  return (
    <Badge
      variant={badgeVariant}
      aria-label={`${label}: ${formattedValue}${unit}, Status: ${statusLabel}`}
    >
      <span className="font-semibold">{label}:</span>
      <span>
        {formattedValue}
        {unit}
      </span>
      <span className="sr-only">Status: {statusLabel}</span>
    </Badge>
  );
}
