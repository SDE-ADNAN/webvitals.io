/**
 * Example usage of Chart components
 * 
 * This file demonstrates how to use the chart components with mock data.
 * This is for documentation purposes and is not used in the application.
 */

import React from 'react';
import { ChartContainer, LCPChart, FIDChart, CLSChart } from './index';

// Example mock data
const mockLcpData = [
  { timestamp: '2025-12-17T10:00:00Z', lcp: 2000 },
  { timestamp: '2025-12-17T11:00:00Z', lcp: 2500 },
  { timestamp: '2025-12-17T12:00:00Z', lcp: 3000 },
  { timestamp: '2025-12-17T13:00:00Z', lcp: 2800 },
  { timestamp: '2025-12-17T14:00:00Z', lcp: 2200 },
];

const mockFidData = [
  { timestamp: '2025-12-17T10:00:00Z', fid: 80 },
  { timestamp: '2025-12-17T11:00:00Z', fid: 120 },
  { timestamp: '2025-12-17T12:00:00Z', fid: 150 },
  { timestamp: '2025-12-17T13:00:00Z', fid: 90 },
  { timestamp: '2025-12-17T14:00:00Z', fid: 110 },
];

const mockClsData = [
  { timestamp: '2025-12-17T10:00:00Z', cls: 0.05 },
  { timestamp: '2025-12-17T11:00:00Z', cls: 0.08 },
  { timestamp: '2025-12-17T12:00:00Z', cls: 0.12 },
  { timestamp: '2025-12-17T13:00:00Z', cls: 0.09 },
  { timestamp: '2025-12-17T14:00:00Z', cls: 0.06 },
];

export function ChartsExample() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Chart Components Example</h1>
      
      {/* LCP Chart */}
      <ChartContainer
        title="Largest Contentful Paint (LCP)"
        description="Measures loading performance. Good: < 2.5s, Poor: > 4s"
      >
        <LCPChart data={mockLcpData} timeRange="24h" />
      </ChartContainer>

      {/* FID Chart */}
      <ChartContainer
        title="First Input Delay (FID)"
        description="Measures interactivity. Good: < 100ms, Poor: > 300ms"
      >
        <FIDChart data={mockFidData} timeRange="24h" />
      </ChartContainer>

      {/* CLS Chart */}
      <ChartContainer
        title="Cumulative Layout Shift (CLS)"
        description="Measures visual stability. Good: < 0.1, Poor: > 0.25"
      >
        <CLSChart data={mockClsData} timeRange="24h" />
      </ChartContainer>
    </div>
  );
}

// Example with different time ranges
export function ChartsWithTimeRanges() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <ChartContainer title="LCP - 24 Hours">
        <LCPChart data={mockLcpData} timeRange="24h" />
      </ChartContainer>

      <ChartContainer title="FID - 7 Days">
        <FIDChart data={mockFidData} timeRange="7d" />
      </ChartContainer>

      <ChartContainer title="CLS - 30 Days">
        <CLSChart data={mockClsData} timeRange="30d" />
      </ChartContainer>
    </div>
  );
}

// Example with empty data
export function ChartsWithEmptyData() {
  return (
    <div className="space-y-6 p-6">
      <ChartContainer
        title="No Data Available"
        description="Charts handle empty data gracefully"
      >
        <LCPChart data={[]} timeRange="24h" />
      </ChartContainer>
    </div>
  );
}
