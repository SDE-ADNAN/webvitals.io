import React from 'react';
import { Badge } from '../UI/Badge';
import {
  getMetricStatus,
  getMetricStatusLabel,
  getMetricUnit,
  METRIC_THRESHOLDS,
} from '@/lib/utils/metrics';

export type MetricType = 'lcp' | 'fid' | 'cls';

export interface MetricCardProps {
  metricName: 'LCP' | 'FID' | 'CLS';
  value: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
}

const metricDisplayNames: Record<MetricType, string> = {
  lcp: 'Largest Contentful Paint',
  fid: 'First Input Delay',
  cls: 'Cumulative Layout Shift',
};

const metricDescriptions: Record<MetricType, string> = {
  lcp: 'Measures loading performance. Good LCP is 2.5s or less.',
  fid: 'Measures interactivity. Good FID is 100ms or less.',
  cls: 'Measures visual stability. Good CLS is 0.1 or less.',
};

export function MetricCard({
  metricName,
  value,
  trend,
  trendValue,
}: MetricCardProps) {
  const metricType = metricName.toLowerCase() as MetricType;
  const status = getMetricStatus(metricType, value);
  const unit = getMetricUnit(metricType);
  const thresholds = METRIC_THRESHOLDS[metricType];

  // Format value based on metric type
  const formattedValue =
    metricType === 'cls' ? value.toFixed(3) : Math.round(value);

  // Get badge variant based on status
  const badgeVariant =
    status === 'good' ? 'green' : status === 'needs-improvement' ? 'yellow' : 'red';

  // Trend arrow icon
  const TrendIcon = () => {
    if (!trend || trend === 'stable') return null;

    return (
      <span
        className={`inline-flex items-center ${
          trend === 'up' ? 'text-red-600' : 'text-green-600'
        }`}
        aria-hidden="true"
      >
        {trend === 'up' ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        )}
      </span>
    );
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      role="article"
      aria-labelledby={`metric-${metricType}-name`}
    >
      {/* Metric Name */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3
            id={`metric-${metricType}-name`}
            className="text-sm font-medium text-gray-600 dark:text-gray-400"
          >
            {metricName}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {metricDisplayNames[metricType]}
          </p>
        </div>
        <Badge variant={badgeVariant}>
          <span className="sr-only">Status: </span>
          {getMetricStatusLabel(status)}
        </Badge>
      </div>

      {/* Metric Value */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span
            className="text-3xl font-bold text-gray-900 dark:text-white"
            aria-label={`Current value: ${formattedValue} ${unit}`}
          >
            {formattedValue}
            {unit && <span className="text-xl ml-1">{unit}</span>}
          </span>
          {trend && trendValue !== undefined && (
            <div className="flex items-center gap-1">
              <TrendIcon />
              <span
                className={`text-sm font-medium ${
                  trend === 'up' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {Math.abs(trendValue).toFixed(1)}%
                <span className="sr-only">
                  {trend === 'up' ? 'increase' : 'decrease'}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Threshold Information */}
      <div
        className="text-xs text-gray-600 dark:text-gray-400 space-y-1"
        role="group"
        aria-label="Threshold information"
      >
        <p className="sr-only">{metricDescriptions[metricType]}</p>
        <div className="flex items-center justify-between">
          <span>Good:</span>
          <span className="font-medium">
            ≤ {thresholds.good}
            {unit}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Needs Improvement:</span>
          <span className="font-medium">
            {metricType === 'cls' 
              ? (thresholds.good + 0.01).toFixed(2) 
              : thresholds.good + 1}-{thresholds.poor}
            {unit}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Poor:</span>
          <span className="font-medium">
            &gt; {thresholds.poor}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
