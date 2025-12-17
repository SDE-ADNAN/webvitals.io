/**
 * CLSChart Component
 * 
 * Area chart displaying Cumulative Layout Shift (CLS) scores over time.
 * Shows threshold lines at 0.1 (good) and 0.25 (poor).
 */

import React from 'react';
import {
  AreaChart,
  Area,
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

interface CLSChartProps {
  data: Array<{
    timestamp: string;
    cls: number;
  }>;
  timeRange?: '24h' | '7d' | '30d';
}

export function CLSChart({ data, timeRange = '24h' }: CLSChartProps) {
  // Format data for Recharts
  const chartData = data.map((item) => ({
    timestamp: new Date(item.timestamp).getTime(),
    cls: Math.round(item.cls * 1000) / 1000, // Round to 3 decimal places
    formattedTime: formatTimestamp(item.timestamp, timeRange),
  }));

  // Sort by timestamp ascending
  chartData.sort((a, b) => a.timestamp - b.timestamp);

  // Calculate summary statistics for accessibility
  const clsValues = chartData.map(d => d.cls);
  const avgCls = clsValues.length > 0 
    ? Math.round((clsValues.reduce((sum, val) => sum + val, 0) / clsValues.length) * 1000) / 1000
    : 0;
  const minCls = clsValues.length > 0 ? Math.min(...clsValues) : 0;
  const maxCls = clsValues.length > 0 ? Math.max(...clsValues) : 0;

  return (
    <div role="img" aria-label={`Area chart showing CLS scores over the last ${timeRange}. Average: ${avgCls.toFixed(3)}, ranging from ${minCls.toFixed(3)} to ${maxCls.toFixed(3)}.`}>
      <div className="sr-only">
        Area chart displaying Cumulative Layout Shift (CLS) scores over time. 
        Average CLS: {avgCls.toFixed(3)}. 
        Minimum: {minCls.toFixed(3)}. 
        Maximum: {maxCls.toFixed(3)}. 
        Good threshold is 0.1, poor threshold is 0.25.
      </div>
      <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <defs>
          <linearGradient id="colorCls" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
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
            value: 'CLS Score',
            angle: -90,
            position: 'insideLeft',
            className: 'fill-gray-600 dark:fill-gray-400',
          }}
          domain={[0, 'auto']}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #fff)',
            border: '1px solid var(--tooltip-border, #e5e7eb)',
            borderRadius: '0.375rem',
          }}
          labelStyle={{ color: 'var(--tooltip-text, #111827)' }}
          formatter={(value: number) => [value.toFixed(3), 'CLS']}
        />
        <Legend
          wrapperStyle={{
            paddingTop: '20px',
          }}
        />
        
        {/* Good threshold line at 0.1 */}
        <ReferenceLine
          y={METRIC_THRESHOLDS.cls.good}
          stroke="#10b981"
          strokeDasharray="3 3"
          label={{
            value: 'Good (0.1)',
            position: 'right',
            fill: '#10b981',
            fontSize: 12,
          }}
        />
        
        {/* Poor threshold line at 0.25 */}
        <ReferenceLine
          y={METRIC_THRESHOLDS.cls.poor}
          stroke="#ef4444"
          strokeDasharray="3 3"
          label={{
            value: 'Poor (0.25)',
            position: 'right',
            fill: '#ef4444',
            fontSize: 12,
          }}
        />
        
        <Area
          type="monotone"
          dataKey="cls"
          stroke="#f59e0b"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCls)"
          name="CLS"
        />
      </AreaChart>
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
