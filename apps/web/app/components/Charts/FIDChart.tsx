/**
 * FIDChart Component
 * 
 * Bar chart displaying First Input Delay (FID) values over time.
 * Shows threshold lines at 100ms (good) and 300ms (poor).
 */

import React from 'react';
import {
  BarChart,
  Bar,
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

interface FIDChartProps {
  data: Array<{
    timestamp: string;
    fid: number;
  }>;
  timeRange?: '24h' | '7d' | '30d';
}

export function FIDChart({ data, timeRange = '24h' }: FIDChartProps) {
  // Format data for Recharts
  const chartData = data.map((item) => ({
    timestamp: new Date(item.timestamp).getTime(),
    fid: Math.round(item.fid),
    formattedTime: formatTimestamp(item.timestamp, timeRange),
  }));

  // Sort by timestamp ascending
  chartData.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate summary statistics for accessibility
  const fidValues = chartData.map(d => d.fid);
  const avgFid = fidValues.length > 0 
    ? Math.round(fidValues.reduce((sum, val) => sum + val, 0) / fidValues.length)
    : 0;
  const minFid = fidValues.length > 0 ? Math.min(...fidValues) : 0;
  const maxFid = fidValues.length > 0 ? Math.max(...fidValues) : 0;

  return (
    <div role="img" aria-label={`Bar chart showing FID values over the last ${timeRange}. Average: ${avgFid}ms, ranging from ${minFid}ms to ${maxFid}ms.`}>
      <div className="sr-only">
        Bar chart displaying First Input Delay (FID) metrics over time. 
        Average FID: {avgFid} milliseconds. 
        Minimum: {minFid} milliseconds. 
        Maximum: {maxFid} milliseconds. 
        Good threshold is 100ms, poor threshold is 300ms.
      </div>
      <ResponsiveContainer width="100%" height={400}>
      <BarChart
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
            value: 'FID (ms)',
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
          formatter={(value: number) => [`${value}ms`, 'FID']}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
          }}
        />
        
        {/* Good threshold line at 100ms */}
        <ReferenceLine
          y={METRIC_THRESHOLDS.fid.good}
          stroke="#10b981"
          strokeDasharray="3 3"
          label={{
            value: 'Good (100ms)',
            position: 'right',
            fill: '#10b981',
            fontSize: 12,
          }}
        />
        
        {/* Poor threshold line at 300ms */}
        <ReferenceLine
          y={METRIC_THRESHOLDS.fid.poor}
          stroke="#ef4444"
          strokeDasharray="3 3"
          label={{
            value: 'Poor (300ms)',
            position: 'right',
            fill: '#ef4444',
            fontSize: 12,
          }}
        />
        
        <Bar
          dataKey="fid"
          fill="#8b5cf6"
          name="FID"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
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
