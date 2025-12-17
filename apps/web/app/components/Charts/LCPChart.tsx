/**
 * LCPChart Component
 * 
 * Line chart displaying Largest Contentful Paint (LCP) values over time.
 * Shows threshold lines at 2500ms (good) and 4000ms (poor).
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { METRIC_THRESHOLDS } from '@/lib/utils/metrics';

interface LCPChartProps {
  data: Array<{
    timestamp: string;
    lcp: number;
  }>;
  timeRange?: '24h' | '7d' | '30d';
}

export function LCPChart({ data, timeRange = '24h' }: LCPChartProps) {
  // Format data for Recharts
  const chartData = data.map((item) => ({
    timestamp: new Date(item.timestamp).getTime(),
    lcp: Math.round(item.lcp),
    formattedTime: formatTimestamp(item.timestamp, timeRange),
  }));

  // Sort by timestamp ascending
  chartData.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate summary statistics for accessibility
  const lcpValues = chartData.map(d => d.lcp);
  const avgLcp = lcpValues.length > 0 
    ? Math.round(lcpValues.reduce((sum, val) => sum + val, 0) / lcpValues.length)
    : 0;
  const minLcp = lcpValues.length > 0 ? Math.min(...lcpValues) : 0;
  const maxLcp = lcpValues.length > 0 ? Math.max(...lcpValues) : 0;

  return (
    <div role="img" aria-label={`Line chart showing LCP values over the last ${timeRange}. Average: ${avgLcp}ms, ranging from ${minLcp}ms to ${maxLcp}ms.`}>
      <div className="sr-only">
        Line chart displaying Largest Contentful Paint (LCP) metrics over time. 
        Average LCP: {avgLcp} milliseconds. 
        Minimum: {minLcp} milliseconds. 
        Maximum: {maxLcp} milliseconds. 
        Good threshold is 2500ms, poor threshold is 4000ms.
      </div>
      <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="formattedTime"
          tick={{ fill: 'currentColor' }}
          className="text-gray-600 dark:text-gray-400"
          label={{
            value: 'Time',
            position: 'insideBottom',
            offset: -5,
            className: 'fill-gray-600 dark:fill-gray-400',
          }}
        />
        <YAxis
          tick={{ fill: 'currentColor' }}
          className="text-gray-600 dark:text-gray-400"
          label={{
            value: 'LCP (ms)',
            angle: -90,
            position: 'insideLeft',
            className: 'fill-gray-600 dark:fill-gray-400',
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid var(--tooltip-border, #e5e7eb)',
            borderRadius: '0.375rem',
          }}
          labelStyle={{ color: 'var(--tooltip-text, #111827)' }}
          formatter={(value: number) => [`${value}ms`, 'LCP']}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
          }}
        />
        
        {/* Good threshold line at 2500ms */}
        <ReferenceLine
          y={METRIC_THRESHOLDS.lcp.good}
          stroke="#10b981"
          strokeDasharray="3 3"
          label={{
            value: 'Good (2500ms)',
            position: 'right',
            fill: '#10b981',
            fontSize: 12,
          }}
        />
        
        {/* Poor threshold line at 4000ms */}
        <ReferenceLine
          y={METRIC_THRESHOLDS.lcp.poor}
          stroke="#ef4444"
          strokeDasharray="3 3"
          label={{
            value: 'Poor (4000ms)',
            position: 'right',
            fill: '#ef4444',
            fontSize: 12,
          }}
        />
        
        <Line
          type="monotone"
          dataKey="lcp"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', r: 3 }}
          activeDot={{ r: 5 }}
          name="LCP"
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  );
}

/**
 * Format timestamp based on time range
 */
function formatTimestamp(timestamp: string, timeRange: '24h' | '7d' | '30d'): string {
  const date = new Date(timestamp);
  
  switch (timeRange) {
    case '24h':
      return format(date, 'HH:mm');
    case '7d':
      return format(date, 'MMM dd');
    case '30d':
      return format(date, 'MMM dd');
    default:
      return format(date, 'MMM dd HH:mm');
  }
}
