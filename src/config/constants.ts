// Application constants and configuration

// Superadmin configuration
export const SUPERADMIN_EMAIL = import.meta.env.VITE_SUPERADMIN_EMAIL || 'admin@test.com';

// Default values
export const DEFAULT_COMPANY_NAME = 'New Company';
export const DEFAULT_DISCOUNT_PERCENTAGE = 10;

// Cache configuration
export const CACHE_TIMES = {
  USER_ROLE: 2 * 60 * 1000, // 2 minutes
  COMPANIES: 5 * 60 * 1000, // 5 minutes
  PROFILES: 10 * 60 * 1000, // 10 minutes
} as const;

// Validation rules
export const VALIDATION = {
  MIN_COMPANY_NAME_LENGTH: 2,
  MAX_COMPANY_NAME_LENGTH: 100,
  MIN_PASSWORD_LENGTH: 6,
} as const;
