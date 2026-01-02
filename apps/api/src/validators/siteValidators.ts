import { z } from "zod";

/**
 * Create site schema
 * Validates site creation input
 * Requirements: 6.2, 6.3
 */
export const createSiteSchema = z.object({
  name: z
    .string({
      required_error: "Site name is required",
    })
    .min(3, "Site name must be at least 3 characters")
    .max(50, "Site name must be at most 50 characters"),
  url: z
    .string({
      required_error: "URL is required",
    })
    .url("Invalid URL format"),
});

/**
 * Update site schema
 * Validates site update input - all fields optional
 * Requirements: 9.3
 */
export const updateSiteSchema = z.object({
  name: z
    .string()
    .min(3, "Site name must be at least 3 characters")
    .max(50, "Site name must be at most 50 characters")
    .optional(),
  url: z
    .string()
    .url("Invalid URL format")
    .optional(),
  isActive: z
    .boolean()
    .optional(),
});

/**
 * Site ID parameter schema
 * Validates siteId URL parameter
 */
export const siteIdParamSchema = z.object({
  siteId: z
    .string({
      required_error: "Site ID is required",
    })
    .min(1, "Site ID is required"),
});

// Type exports for use in controllers/services
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>;
export type SiteIdParam = z.infer<typeof siteIdParamSchema>;
