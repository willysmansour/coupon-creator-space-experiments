// Auth domain exports
export { useAuth } from './hooks/useAuth';
export { useUserRole, type UserRole, type UserWithRole } from './hooks/useUserRole';
export { useAssignRole } from './hooks/useRoleManagement';
export { useSecureAdminSession } from './hooks/useSecureAdminSession';

// Re-export for backward compatibility
export type { UserRole as UserRoleType, UserWithRole as UserWithRoleType } from './hooks/useUserRole';
