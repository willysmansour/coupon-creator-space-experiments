/**
 * @fileoverview Centralized documentation and type definitions for the application
 * @module documentation
 */

/**
 * Authentication hook return type
 * @typedef {Object} AuthState
 * @property {User|null} user - Current authenticated user
 * @property {Session|null} session - Current session object
 * @property {boolean} loading - Loading state indicator
 */

/**
 * User role types in the system
 * @typedef {'super_admin' | 'company_admin' | 'customer'} UserRole
 */

/**
 * Error types for structured error handling
 * @typedef {'AUTHENTICATION' | 'NETWORK' | 'VALIDATION' | 'PERMISSION' | 'DATABASE' | 'UNKNOWN'} ErrorType
 */

/**
 * Query configuration options
 * @typedef {Object} QueryOptions
 * @property {number} staleTime - Time in ms before data is considered stale
 * @property {number} gcTime - Time in ms before garbage collection
 * @property {boolean} refetchOnWindowFocus - Whether to refetch on window focus
 * @property {boolean} refetchOnMount - Whether to refetch on component mount
 * @property {boolean} refetchOnReconnect - Whether to refetch on reconnect
 * @property {Function} retry - Retry strategy function
 * @property {Function} retryDelay - Delay between retries
 */

/**
 * Company registration data
 * @typedef {Object} CompanyRegistrationData
 * @property {string} email - User email address
 * @property {string} password - User password
 * @property {string} companyName - Name of the company
 * @property {string} [firstName] - User's first name
 * @property {string} [lastName] - User's last name
 * @property {string} [logo] - Company logo URL
 */

/**
 * Admin session information
 * @typedef {Object} AdminSession
 * @property {boolean} isAuthenticated - Whether admin is authenticated
 * @property {boolean} isLoading - Loading state
 * @property {string|null} error - Error message if any
 * @property {number|null} sessionExpiry - Session expiry timestamp
 */

/**
 * Structured error object
 * @typedef {Object} StructuredError
 * @property {ErrorType} type - Type of error
 * @property {string} message - Error message
 * @property {any} [originalError] - Original error object
 * @property {Object} [context] - Additional context
 * @property {number} timestamp - Error timestamp
 */

export const API_DOCUMENTATION = {
  hooks: {
    useAuth: {
      description: 'Hook for managing authentication state',
      returns: 'AuthState object with user, session, and loading state',
      example: `
        const { user, session, loading } = useAuth();
        if (loading) return <Spinner />;
        if (!user) return <Login />;
      `
    },
    useUserRole: {
      description: 'Hook for fetching and managing user roles',
      returns: 'Query result with user role data',
      example: `
        const { data: userRole, isLoading } = useUserRole(userId);
        if (userRole?.role === 'super_admin') { ... }
      `
    },
    useSecureAdminSession: {
      description: 'Hook for secure super admin authentication',
      returns: 'AdminSession object with authentication state',
      example: `
        const { isAuthenticated, isLoading } = useSecureAdminSession();
        if (!isAuthenticated) return <Redirect to="/login" />;
      `
    },
    useRegisterCompany: {
      description: 'Hook for company registration process',
      returns: 'Mutation object for registering companies',
      example: `
        const registerCompany = useRegisterCompany();
        await registerCompany.mutateAsync(companyData);
      `
    }
  },
  
  utils: {
    ErrorHandler: {
      description: 'Centralized error handling utility',
      methods: {
        handle: 'Process and categorize errors',
        getErrors: 'Retrieve error history',
        clearErrors: 'Clear error history'
      },
      example: `
        try {
          await someOperation();
        } catch (error) {
          ErrorHandler.handle(error, { context: 'operation_name' });
        }
      `
    },
    
    QueryConfig: {
      description: 'React Query configuration utilities',
      exports: {
        createQueryClient: 'Create configured QueryClient instance',
        authQueryOptions: 'Query options for auth-related queries',
        companyQueryOptions: 'Query options for company data',
        profileQueryOptions: 'Query options for profile data'
      }
    }
  },
  
  components: {
    ErrorBoundary: {
      description: 'React error boundary for graceful error handling',
      props: {
        children: 'React children to render',
        fallback: 'Optional custom error UI'
      },
      example: `
        <ErrorBoundary fallback={<CustomErrorUI />}>
          <App />
        </ErrorBoundary>
      `
    },
    
    RequireAuth: {
      description: 'Route guard component for authentication',
      props: {
        children: 'Protected content',
        redirectTo: 'Redirect path if not authenticated'
      }
    },
    
    AdminDashboardStats: {
      description: 'Statistics display for admin dashboard',
      props: {
        stats: 'Object containing user, company, and coupon statistics'
      }
    }
  },
  
  database: {
    tables: {
      users: 'Authentication users (auth.users)',
      profiles: 'User profiles with additional information',
      companies: 'Company registration and information',
      user_roles: 'User role assignments',
      uploads: 'File upload records',
      coupons: 'Generated coupon codes',
      campaigns: 'Marketing campaigns'
    },
    
    rls_policies: {
      profiles: 'Users can view own profile, super admins can view all',
      companies: 'Public can view active companies, admins can manage',
      coupons: 'Company admins can view their coupons, customers can view earned coupons',
      user_roles: 'Users can view own role, super admins can manage all'
    },
    
    indexes: {
      performance: 'Indexes on foreign keys and frequently queried columns',
      composite: 'Composite indexes for common query patterns',
      partial: 'Partial indexes for filtered queries'
    }
  }
}

/**
 * API endpoint documentation
 */
export const API_ENDPOINTS = {
  supabase: {
    auth: {
      signUp: 'POST /auth/v1/signup',
      signIn: 'POST /auth/v1/token?grant_type=password',
      signOut: 'POST /auth/v1/logout',
      getSession: 'GET /auth/v1/session',
      refreshToken: 'POST /auth/v1/token?grant_type=refresh_token'
    },
    
    database: {
      select: 'GET /rest/v1/{table}',
      insert: 'POST /rest/v1/{table}',
      update: 'PATCH /rest/v1/{table}',
      delete: 'DELETE /rest/v1/{table}',
      rpc: 'POST /rest/v1/rpc/{function}'
    },
    
    storage: {
      upload: 'POST /storage/v1/object/{bucket}',
      download: 'GET /storage/v1/object/{bucket}/{path}',
      delete: 'DELETE /storage/v1/object/{bucket}/{path}',
      list: 'GET /storage/v1/object/list/{bucket}'
    }
  }
}
