import { Metric, MetricSummary, MetricFilters } from "./types";

/**
 * Generate mock metrics with realistic Core Web Vitals values
 * @param siteId - The site ID to generate metrics for
 * @param count - Number of metrics to generate (default: 100)
 * @returns Array of mock metrics
 */
export function generateMockMetrics(
  siteId: string,
  count: number = 100
): Metric[] {
  const metrics: Metric[] = [];
  const now = Date.now();
  const siteIdNum = parseInt(siteId) || 1;

  const deviceTypes: Array<"mobile" | "desktop" | "tablet"> = [
    "mobile",
    "desktop",
    "tablet",
  ];
  const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
  const osNames = ["Windows", "macOS", "Linux", "iOS", "Android"];

  for (let i = 0; i < count; i++) {
    // Generate realistic LCP values (1000-6000ms)
    const lcp = Math.random() * 5000 + 1000;

    // Generate realistic FID values (50-450ms)
    const fid = Math.random() * 400 + 50;

    // Generate realistic CLS values (0-0.4)
    const cls = Math.random() * 0.4;

    // Generate realistic TTFB values (100-1100ms)
    const ttfb = Math.random() * 1000 + 100;

    // Generate realistic FCP values (500-3500ms)
    const fcp = Math.random() * 3000 + 500;

    // Generate realistic TTI values (1000-8000ms)
    const tti = Math.random() * 7000 + 1000;

    // Randomly select device type, browser, and OS
    const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
    const browserName = browsers[Math.floor(Math.random() * browsers.length)];
    const osName = osNames[Math.floor(Math.random() * osNames.length)];

    // Generate timestamp for time-series data (hourly intervals going back)
    const timestamp = new Date(now - i * 3600000).toISOString();

    metrics.push({
      id: i + 1,
      siteId: siteIdNum,
      lcp,
      fid,
      cls,
      ttfb,
      fcp,
      tti,
      deviceType,
      browserName,
      osName,
      pageUrl: `https://example.com/page-${Math.floor(Math.random() * 10)}`,
      pageTitle: `Page ${Math.floor(Math.random() * 10)}`,
      connectionType: Math.random() > 0.5 ? "4g" : "wifi",
      effectiveType: Math.random() > 0.5 ? "4g" : "3g",
      rtt: Math.random() * 200 + 50,
      downlink: Math.random() * 10 + 1,
      sessionId: `session_${Math.random().toString(36).substring(7)}`,
      userId: `user_${Math.random().toString(36).substring(7)}`,
      timestamp,
    });
  }

  return metrics;
}

/**
 * Calculate summary statistics for a set of metrics
 * @param metrics - Array of metrics to summarize
 * @returns Metric summary with averages and percentiles
 */
function calculateMetricSummary(metrics: Metric[]): MetricSummary {
  if (metrics.length === 0) {
    return {
      avgLcp: 0,
      avgFid: 0,
      avgCls: 0,
      p95Lcp: 0,
      p95Fid: 0,
      p95Cls: 0,
      count: 0,
    };
  }

  // Extract and sort values for percentile calculation
  const lcpValues = metrics
    .map((m) => m.lcp || 0)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  const fidValues = metrics
    .map((m) => m.fid || 0)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  const clsValues = metrics
    .map((m) => m.cls || 0)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);

  // Calculate averages
  const avgLcp = average(lcpValues);
  const avgFid = average(fidValues);
  const avgCls = average(clsValues);

  // Calculate 95th percentiles
  const p95Lcp = percentile(lcpValues, 95);
  const p95Fid = percentile(fidValues, 95);
  const p95Cls = percentile(clsValues, 95);

  return {
    avgLcp,
    avgFid,
    avgCls,
    p95Lcp,
    p95Fid,
    p95Cls,
    count: metrics.length,
  };
}

/**
 * Calculate average of an array of numbers
 */
function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate percentile of an array of sorted numbers
 */
function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

/**
 * Get mock metrics with optional filtering and simulated network delay
 * @param siteId - The site ID to get metrics for
 * @param filters - Optional filters for device type, browser, and time range
 * @returns Promise resolving to metrics and summary
 */
export function getMockMetrics(
  siteId: string,
  filters?: MetricFilters
): Promise<{ metrics: Metric[]; summary: MetricSummary }> {
  return new Promise((resolve) => {
    // Simulate network delay of 800ms
    setTimeout(() => {
      let metrics = generateMockMetrics(siteId, 100);

      // Apply device type filter
      if (filters?.deviceType) {
        metrics = metrics.filter((m) => m.deviceType === filters.deviceType);
      }

      // Apply browser filter
      if (filters?.browserName) {
        metrics = metrics.filter((m) => m.browserName === filters.browserName);
      }

      // Apply time range filter
      if (filters?.timeRange) {
        const now = Date.now();
        let cutoffTime: number;

        switch (filters.timeRange) {
          case "24h":
            cutoffTime = now - 24 * 3600000;
            break;
          case "7d":
            cutoffTime = now - 7 * 24 * 3600000;
            break;
          case "30d":
            cutoffTime = now - 30 * 24 * 3600000;
            break;
          default:
            cutoffTime = 0;
        }

        metrics = metrics.filter(
          (m) => new Date(m.timestamp).getTime() >= cutoffTime
        );
      }

      // Calculate summary statistics
      const summary = calculateMetricSummary(metrics);

      resolve({ metrics, summary });
    }, 800);
  });
}
