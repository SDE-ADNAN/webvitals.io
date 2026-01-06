import { prisma } from "../lib/prisma";
import { MetricInput, MetricsQuery } from "../validators/metricValidators";

/**
 * Metric response type
 */
export interface MetricResponse {
  id: number;
  siteId: number;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
  fcp: number | null;
  tti: number | null;
  deviceType: string;
  browserName: string | null;
  osName: string | null;
  pageUrl: string | null;
  timestamp: Date;
}

/**
 * Metric summary statistics
 */
export interface MetricSummary {
  count: number;
  averages: {
    lcp: number;
    fid: number;
    cls: number;
  };
  p95: {
    lcp: number;
    fid: number;
    cls: number;
  };
}

/**
 * Validate that a site exists by its public siteId
 * Used for metric submission authentication via X-Site-ID header
 * Requirements: 11.1, 11.2
 */
export async function validateSiteExists(
  siteId: string
): Promise<{ id: number; siteId: string } | null> {
  const site = await prisma.site.findUnique({
    where: { siteId },
    select: { id: true, siteId: true },
  });

  return site;
}

/**
 * Submit a new metric for a site
 * Requirements: 11.1-11.5
 */
export async function submitMetric(
  siteInternalId: number,
  data: MetricInput
): Promise<MetricResponse> {
  const metric = await prisma.metric.create({
    data: {
      siteId: siteInternalId,
      lcp: data.lcp,
      fid: data.fid,
      cls: data.cls,
      ttfb: data.ttfb,
      fcp: data.fcp,
      tti: data.tti,
      deviceType: data.deviceType,
      browserName: data.browserName,
      osName: data.osName,
      pageUrl: data.pageUrl,
      timestamp: new Date(),
    },
  });

  return metric;
}

/**
 * Get site by public siteId and verify ownership
 * Requirements: 12.1, 12.2
 */
export async function getSiteWithOwnershipCheck(
  siteId: string,
  userId: number
): Promise<{ id: number; siteId: string }> {
  const site = await prisma.site.findUnique({
    where: { siteId },
    select: { id: true, siteId: true, userId: true },
  });

  if (!site) {
    const error = new Error("Site not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (site.userId !== userId) {
    const error = new Error("You do not have permission to access this site");
    (error as any).statusCode = 403;
    throw error;
  }

  return { id: site.id, siteId: site.siteId };
}

/**
 * Calculate time range filter date
 */
function getTimeRangeDate(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

/**
 * Get metrics for a site with filters
 * Requirements: 12.1-12.5
 */
export async function getMetrics(
  siteInternalId: number,
  query: MetricsQuery
): Promise<MetricResponse[]> {
  const { timeRange = "24h", deviceType, browserName } = query;

  // Build where clause with filters
  const where: any = {
    siteId: siteInternalId,
    timestamp: {
      gte: getTimeRangeDate(timeRange),
    },
  };

  // Add optional filters
  if (deviceType) {
    where.deviceType = deviceType;
  }

  if (browserName) {
    where.browserName = browserName;
  }

  const metrics = await prisma.metric.findMany({
    where,
    orderBy: { timestamp: "desc" },
  });

  return metrics;
}


/**
 * Calculate the average of an array of numbers
 * Returns 0 if array is empty
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate the 95th percentile of an array of numbers
 * Returns 0 if array is empty
 */
export function calculateP95(values: number[]): number {
  if (values.length === 0) return 0;
  
  // Sort values in ascending order
  const sorted = [...values].sort((a, b) => a - b);
  
  // Calculate the index for 95th percentile
  const index = Math.ceil(0.95 * sorted.length) - 1;
  const safeIndex = Math.max(0, index);
  
  return sorted[safeIndex] ?? 0;
}

/**
 * Calculate summary statistics for metrics
 * Requirements: 13.1-13.5
 */
export function calculateMetricSummary(metrics: MetricResponse[]): MetricSummary {
  // Extract non-null values for each metric type
  const lcpValues = metrics
    .map((m) => m.lcp)
    .filter((v): v is number => v !== null);
  const fidValues = metrics
    .map((m) => m.fid)
    .filter((v): v is number => v !== null);
  const clsValues = metrics
    .map((m) => m.cls)
    .filter((v): v is number => v !== null);

  return {
    count: metrics.length,
    averages: {
      lcp: calculateAverage(lcpValues),
      fid: calculateAverage(fidValues),
      cls: calculateAverage(clsValues),
    },
    p95: {
      lcp: calculateP95(lcpValues),
      fid: calculateP95(fidValues),
      cls: calculateP95(clsValues),
    },
  };
}

/**
 * Get metrics summary for a site with filters
 * Requirements: 13.1-13.5
 */
export async function getMetricsSummary(
  siteInternalId: number,
  query: MetricsQuery
): Promise<MetricSummary> {
  // Get filtered metrics
  const metrics = await getMetrics(siteInternalId, query);
  
  // Calculate and return summary
  return calculateMetricSummary(metrics);
}
