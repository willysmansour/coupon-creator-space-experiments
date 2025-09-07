import { notify } from "@/lib/notify";

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  PERMISSION = 'permission',
  NETWORK = 'network',
  DATABASE = 'database',
  UNKNOWN = 'unknown'
}

export interface StructuredError {
  type: ErrorType;
  message: string;
  originalError?: any;
  context?: Record<string, any>;
  timestamp: number;
}

// Centralized error handler with structured logging
export class ErrorHandler {
  private static errors: StructuredError[] = [];

  static handle(error: any, context?: Record<string, any>): StructuredError {
    const structuredError = this.categorizeError(error, context);
    
    // Log to console for debugging
    console.error('[ErrorHandler]', {
      type: structuredError.type,
      message: structuredError.message,
      context: structuredError.context,
      originalError: structuredError.originalError,
      timestamp: new Date(structuredError.timestamp).toISOString()
    });
    
    // Store error for potential reporting
    this.errors.push(structuredError);
    
    // Show user-friendly toast
    this.showUserMessage(structuredError);
    
    return structuredError;
  }

  private static categorizeError(error: any, context?: Record<string, any>): StructuredError {
    const timestamp = Date.now();
    
    // Authentication errors
    if (error?.code === 'invalid_credentials' || error?.message?.includes('Invalid login credentials')) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: error.message || 'Invalid login credentials',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Validation errors
    if (error?.code === 'validation_error' || error?.message?.includes('Email already registered')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message || 'An account with this email already exists',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Permission/Authorization errors
    if (error?.code === '42501' || error?.message?.includes('Permission denied')) {
      return {
        type: ErrorType.PERMISSION,
        message: 'You do not have permission for this action',
        originalError: error,
        context,
        timestamp
      };
    }
    
    if (error?.code === 'PGRST301' || error?.message?.includes('RLS')) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: 'You do not have permission for this action',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('Failed to fetch') || error?.message?.includes('network')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Network error - please try again',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Database errors
    if (error?.code === '23505' || error?.code?.startsWith('23') || error?.message?.includes('constraint') || error?.message?.includes('duplicate key')) {
      return {
        type: ErrorType.DATABASE,
        message: 'Database error - contact support',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Unknown errors
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unexpected error occurred',
      originalError: error,
      context,
      timestamp
    };
  }

  private static showUserMessage(error: StructuredError) {
    switch (error.type) {
      case ErrorType.VALIDATION:
        notify.warning('Validation error', { description: error.message });
        break;
      case ErrorType.AUTHENTICATION:
        notify.error('Authentication error', { description: error.message });
        break;
      case ErrorType.AUTHORIZATION:
        notify.error(error.message, { duration: 5000 });
        break;
      case ErrorType.PERMISSION:
        notify.error('Permission error', { description: 'You do not have permission to perform this action' });
        break;
      case ErrorType.NETWORK:
        notify.error('Network error', { description: 'Check your connection and try again' });
        break;
      case ErrorType.DATABASE:
        notify.error('Database error', { description: 'This data already exists or is invalid' });
        break;
      case ErrorType.UNKNOWN:
      default:
        notify.error('Unexpected error', { description: 'An unexpected error occurred. Please try again later.' });
    }
  }

  static getErrors(): StructuredError[] {
    return this.errors;
  }

  static getRecentErrors(limit = 10): StructuredError[] {
    return this.errors.slice(-limit);
  }

  static clearErrors() {
    this.errors = [];
  }
}

// Convenience function for easy usage
export const handleError = (error: any, context?: Record<string, any>) => {
  return ErrorHandler.handle(error, context);
};
