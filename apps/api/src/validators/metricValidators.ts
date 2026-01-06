import { z } from "zod";

/**
 * Metric submission schema
 * Validates metric data submitted by tracking SDK
 * Requirements: 11.3
 */
export const metricSchema = z.object({
  // Core Web Vitals - all numeric values
  lcp: z
    .number({
      required_error: "LCP value is required",
      invalid_type_error: "LCP must be a number",
    })
    .nonnegative("LCP must be a non-negative number"),
  fid: z
    .number({
      required_error: "FID value is required",
      invalid_type_error: "FID must be a number",
    })
    .nonnegative("FID must be a non-negative number"),
  cls: z
    .number({
      required_error: "CLS value is required",
      invalid_type_error: "CLS must be a number",
    })
    .nonnegative("CLS must be a non-negative number"),
  
  // Additional performance metrics - optional
  ttfb: z
    .number({
      invalid_type_error: "TTFB must be a number",
    })
    .nonnegative("TTFB must be a non-negative number")
    .optional(),
  fcp: z
    .number({
      invalid_type_error: "FCP must be a number",
    })
    .nonnegative("FCP must be a non-negative number")
    .optional(),
  tti: z
    .number({
      invalid_type_error: "TTI must be a number",
    })
    .nonnegative("TTI must be a non-negative number")
    .optional(),
  
  // Device and browser information - strings
  deviceType: z
    .string({
      required_error: "Device type is required",
    })
    .min(1, "Device type is required"),
  browserName: z
    .string({
      required_error: "Browser name is required",
    })
    .min(1, "Browser name is required"),
  osName: z
    .string()
    .min(1, "OS name must not be empty")
    .optional(),
  
  // Optional page information
  pageUrl: z
    .string()
    .url("Invalid page URL format")
    .optional(),
});

/**
 * Metrics query schema
 * Validates query parameters for metrics retrieval
 */
export const metricsQuerySchema = z.object({
  timeRange: z
    .enum(["24h", "7d", "30d"], {
      errorMap: () => ({ message: "Time range must be 24h, 7d, or 30d" }),
    })
    .optional()
    .default("24h"),
  deviceType: z
    .string()
    .optional(),
  browserName: z
    .string()
    .optional(),
});

// Type exports for use in controllers/services
export type MetricInput = z.infer<typeof metricSchema>;
export type MetricsQuery = z.infer<typeof metricsQuerySchema>;
