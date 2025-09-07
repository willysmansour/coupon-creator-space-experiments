import { z } from "zod";
import { VALIDATION } from "@/config/constants";

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`)
});

export const companyRegistrationSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z.string()
    .min(VALIDATION.MIN_PASSWORD_LENGTH, `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`),
  companyName: z.string()
    .min(VALIDATION.MIN_COMPANY_NAME_LENGTH, `Company name must be at least ${VALIDATION.MIN_COMPANY_NAME_LENGTH} characters`)
    .max(VALIDATION.MAX_COMPANY_NAME_LENGTH, `Company name must be at most ${VALIDATION.MAX_COMPANY_NAME_LENGTH} characters`)
    .trim(),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters")
    .trim()
    .optional(),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters")
    .trim()
    .optional()
});

// Company validation schemas
export const companyUpdateSchema = z.object({
  name: z.string()
    .min(VALIDATION.MIN_COMPANY_NAME_LENGTH, `Company name must be at least ${VALIDATION.MIN_COMPANY_NAME_LENGTH} characters`)
    .max(VALIDATION.MAX_COMPANY_NAME_LENGTH, `Company name must be at most ${VALIDATION.MAX_COMPANY_NAME_LENGTH} characters`)
    .trim(),
  discount_percentage: z.number()
    .min(1, "Discount must be at least 1%")
    .max(99, "Discount must be at most 99%")
    .optional(),
  content_description: z.string()
    .max(500, "Description must be at most 500 characters")
    .optional()
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  first_name: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters")
    .trim(),
  last_name: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters")
    .trim(),
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email address")
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type CompanyRegistrationFormData = z.infer<typeof companyRegistrationSchema>;
export type CompanyUpdateFormData = z.infer<typeof companyUpdateSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
