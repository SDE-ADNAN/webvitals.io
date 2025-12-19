/**
 * Form validation schemas using Zod
 */

import { z } from "zod";

/**
 * Site form validation schema
 * Requirements: 23.4, 23.5
 */
export const siteSchema = z.object({
  name: z
    .string()
    .min(3, "Site name must be at least 3 characters")
    .max(50, "Site name must be less than 50 characters")
    .trim(),
  url: z
    .string()
    .regex(/^https?:\/\/.+/, "URL must start with http:// or https://")
    .url("Please enter a valid URL")
    .trim(),
});

export type SiteFormData = z.infer<typeof siteSchema>;

/**
 * Login form validation schema
 * Requirements: 23.1
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Signup form validation schema with password complexity requirements
 * Requirements: 23.1
 */
export const signupSchema = z
  .object({
    email: z
      .string()
      .email("Please enter a valid email address")
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * Alert configuration schema
 */
export const alertSchema = z.object({
  siteId: z.number().positive("Site ID must be a positive number"),
  metricType: z.enum(["lcp", "fid", "cls", "ttfb", "fcp"], {
    errorMap: () => ({ message: "Please select a valid metric type" }),
  }),
  threshold: z.number().positive("Threshold must be a positive number"),
  enabled: z.boolean().default(true),
});

export type AlertFormData = z.infer<typeof alertSchema>;

/**
 * User profile update schema
 */
export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .trim()
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .trim()
    .toLowerCase(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
