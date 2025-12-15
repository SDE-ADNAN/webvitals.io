/**
 * Formatting utilities for displaying metrics and timestamps
 */

import { format, formatDistanceToNow } from "date-fns";

/**
 * Format a metric value for display with appropriate unit
 * @param value - The metric value to format
 * @param unit - The unit to display (ms, s, or empty string for unitless)
 * @returns Formatted string with value and unit
 */
export function formatMetricValue(value: number, unit: string = ""): string {
  // Round to 2 decimal places for display
  const rounded = Math.round(value * 100) / 100;

  // Format with appropriate precision
  if (unit === "ms" || unit === "s") {
    // For time values, show up to 2 decimal places, removing trailing zeros
    const formatted = rounded.toFixed(2).replace(/\.?0+$/, "");
    return unit ? `${formatted}${unit}` : formatted;
  } else {
    // For unitless values (like CLS), show up to 3 decimal places
    const formatted = rounded.toFixed(3).replace(/\.?0+$/, "");
    return unit ? `${formatted}${unit}` : formatted;
  }
}

/**
 * Format a timestamp for display
 * @param timestamp - ISO 8601 timestamp string or Date object
 * @param formatString - Optional format string (defaults to "MMM d, yyyy h:mm a")
 * @returns Formatted date string
 */
export function formatTimestamp(
  timestamp: string | Date,
  formatString: string = "MMM d, yyyy h:mm a"
): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return format(date, formatString);
}

/**
 * Format a timestamp as relative time (e.g., "2 hours ago")
 * @param timestamp - ISO 8601 timestamp string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a duration in milliseconds to a human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m", "45s", "1d 3h")
 */
export function formatDuration(ms: number): string {
  if (ms < 0) {
    return "0s";
  }

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  } else if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  } else if (seconds > 0) {
    return `${seconds}s`;
  } else {
    return `${ms}ms`;
  }
}

/**
 * Format a number with thousands separators
 * @param value - Number to format
 * @returns Formatted number string with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format a percentage value
 * @param value - Decimal value (e.g., 0.75 for 75%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
