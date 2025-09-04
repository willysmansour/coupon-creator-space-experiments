// DEPRECATED: This file is kept for backward compatibility
// New code should import from domains/auth/ and domains/companies/

// Re-export everything from the new domain structure
export { 
  useAuth, 
  useUserRole, 
  useAssignRole,
  type UserRole,
  type UserWithRole,
  type UserRoleType,
  type UserWithRoleType
} from '@/domains/auth';

export { useRegisterCompany } from '@/domains/companies';

// Keep existing exports that might be used elsewhere
// TODO: Remove this file once all imports are updated to use domain structure