/**
 * Metric utilities for Core Web Vitals classification and display
 */

export type MetricStatus = "good" | "needs-improvement" | "poor";

export interface MetricThresholds {
  good: number;
  poor: number;
}

/**
 * Metric thresholds based on Google's Core Web Vitals standards
 * - good: Values at or below this threshold are considered good
 * - poor: Values above this threshold are considered poor
 * - needs-improvement: Values between good and poor thresholds
 */
export const METRIC_THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 }, // milliseconds
  fid: { good: 100, poor: 300 }, // milliseconds
  cls: { good: 0.1, poor: 0.25 }, // score
  ttfb: { good: 800, poor: 1800 }, // milliseconds
  fcp: { good: 1800, poor: 3000 }, // milliseconds
} as const;

/**
 * Get the status classification for a metric value
 * @param metricType - The type of metric (lcp, fid, cls, ttfb, fcp)
 * @param value - The metric value to classify
 * @returns The status classification: "good", "needs-improvement", or "poor"
 */
export function getMetricStatus(
  metricType: keyof typeof METRIC_THRESHOLDS,
  value: number
): MetricStatus {
  const thresholds = METRIC_THRESHOLDS[metricType];

  if (value <= thresholds.good) {
    return "good";
  } else if (value <= thresholds.poor) {
    return "needs-improvement";
  } else {
    return "poor";
  }
}

/**
 * Get Tailwind CSS classes for a metric status
 * @param status - The metric status
 * @returns Tailwind CSS classes for text and background colors
 */
export function getMetricColor(status: MetricStatus): string {
  switch (status) {
    case "good":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
    case "needs-improvement":
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
    case "poor":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
  }
}

/**
 * Get a human-readable label for a metric status
 * @param status - The metric status
 * @returns Human-readable status label
 */
export function getMetricStatusLabel(status: MetricStatus): string {
  switch (status) {
    case "good":
      return "Good";
    case "needs-improvement":
      return "Needs Improvement";
    case "poor":
      return "Poor";
  }
}

/**
 * Get the unit for a metric type
 * @param metricType - The type of metric
 * @returns The unit string for display
 */
export function getMetricUnit(metricType: keyof typeof METRIC_THRESHOLDS): string {
  switch (metricType) {
    case "lcp":
    case "fid":
    case "ttfb":
    case "fcp":
      return "ms";
    case "cls":
      return "";
  }
}
