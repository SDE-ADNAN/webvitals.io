import { z } from "zod";

/**
 * Metric type enum values
 */
export const MetricType = z.enum(["lcp", "fid", "cls"], {
  errorMap: () => ({ message: "Metric type must be lcp, fid, or cls" }),
});

/**
 * Alert condition enum values
 */
export const AlertCondition = z.enum(["greater_than", "less_than"], {
  errorMap: () => ({ message: "Condition must be greater_than or less_than" }),
});

/**
 * Create alert schema
 * Validates alert creation input
 * Requirements: 14.3, 14.4, 14.5
 */
export const createAlertSchema = z.object({
  siteId: z
    .number({
      required_error: "Site ID is required",
      invalid_type_error: "Site ID must be a number",
    })
    .int("Site ID must be an integer")
    .positive("Site ID must be a positive number"),
  metricType: MetricType,
  threshold: z
    .number({
      required_error: "Threshold is required",
      invalid_type_error: "Threshold must be a number",
    })
    .positive("Threshold must be a positive number"),
  condition: AlertCondition,
});

/**
 * Update alert schema
 * Validates alert update input - all fields optional
 * Requirements: 16.3, 16.4
 */
export const updateAlertSchema = z.object({
  threshold: z
    .number({
      invalid_type_error: "Threshold must be a number",
    })
    .positive("Threshold must be a positive number")
    .optional(),
  condition: AlertCondition.optional(),
  isActive: z
    .boolean()
    .optional(),
});

/**
 * Alert ID parameter schema
 * Validates alertId URL parameter
 */
export const alertIdParamSchema = z.object({
  alertId: z
    .string({
      required_error: "Alert ID is required",
    })
    .min(1, "Alert ID is required"),
});

// Type exports for use in controllers/services
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
export type AlertIdParam = z.infer<typeof alertIdParamSchema>;
export type MetricTypeValue = z.infer<typeof MetricType>;
export type AlertConditionValue = z.infer<typeof AlertCondition>;
