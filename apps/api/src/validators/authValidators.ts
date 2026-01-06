import { z } from "zod";

/**
 * Registration schema
 * Validates user registration input
 * Requirements: 3.1, 3.2
 */
export const registerSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters"),
  firstName: z
    .string({
      required_error: "First name is required",
    })
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string({
      required_error: "Last name is required",
    })
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),
});

/**
 * Login schema
 * Validates user login input
 * Requirements: 4.1
 */
export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format"),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(1, "Password is required"),
});

// Type exports for use in controllers/services
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
