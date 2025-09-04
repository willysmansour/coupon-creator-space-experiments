import { z } from "zod";
import { VALIDATION } from "@/config/constants";

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string()
    .min(1, "Email är obligatorisk")
    .email("Ogiltig email-adress"),
  password: z.string()
    .min(VALIDATION.MIN_PASSWORD_LENGTH, `Lösenord måste vara minst ${VALIDATION.MIN_PASSWORD_LENGTH} tecken`)
});

export const companyRegistrationSchema = z.object({
  email: z.string()
    .min(1, "Email är obligatorisk")
    .email("Ogiltig email-adress"),
  password: z.string()
    .min(VALIDATION.MIN_PASSWORD_LENGTH, `Lösenord måste vara minst ${VALIDATION.MIN_PASSWORD_LENGTH} tecken`),
  companyName: z.string()
    .min(VALIDATION.MIN_COMPANY_NAME_LENGTH, `Företagsnamn måste vara minst ${VALIDATION.MIN_COMPANY_NAME_LENGTH} tecken`)
    .max(VALIDATION.MAX_COMPANY_NAME_LENGTH, `Företagsnamn får vara max ${VALIDATION.MAX_COMPANY_NAME_LENGTH} tecken`)
    .trim(),
  firstName: z.string()
    .min(1, "Förnamn är obligatoriskt")
    .max(50, "Förnamn får vara max 50 tecken")
    .trim()
    .optional(),
  lastName: z.string()
    .min(1, "Efternamn är obligatoriskt")
    .max(50, "Efternamn får vara max 50 tecken")
    .trim()
    .optional()
});

// Company validation schemas
export const companyUpdateSchema = z.object({
  name: z.string()
    .min(VALIDATION.MIN_COMPANY_NAME_LENGTH, `Företagsnamn måste vara minst ${VALIDATION.MIN_COMPANY_NAME_LENGTH} tecken`)
    .max(VALIDATION.MAX_COMPANY_NAME_LENGTH, `Företagsnamn får vara max ${VALIDATION.MAX_COMPANY_NAME_LENGTH} tecken`)
    .trim(),
  discount_percentage: z.number()
    .min(1, "Rabatt måste vara minst 1%")
    .max(99, "Rabatt får vara max 99%")
    .optional(),
  content_description: z.string()
    .max(500, "Beskrivning får vara max 500 tecken")
    .optional()
});

// Profile validation schemas
export const profileUpdateSchema = z.object({
  first_name: z.string()
    .min(1, "Förnamn är obligatoriskt")
    .max(50, "Förnamn får vara max 50 tecken")
    .trim(),
  last_name: z.string()
    .min(1, "Efternamn är obligatoriskt")
    .max(50, "Efternamn får vara max 50 tecken")
    .trim(),
  email: z.string()
    .min(1, "Email är obligatorisk")
    .email("Ogiltig email-adress")
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type CompanyRegistrationFormData = z.infer<typeof companyRegistrationSchema>;
export type CompanyUpdateFormData = z.infer<typeof companyUpdateSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
