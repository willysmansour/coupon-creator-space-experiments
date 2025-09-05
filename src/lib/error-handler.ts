import { toast } from "sonner";

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
        message: error.message || 'Felaktiga inloggningsuppgifter',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Validation errors
    if (error?.code === 'validation_error' || error?.message?.includes('Email already registered')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message || 'Ett konto med denna email finns redan',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Permission/Authorization errors
    if (error?.code === '42501' || error?.message?.includes('Permission denied')) {
      return {
        type: ErrorType.PERMISSION,
        message: 'Du har inte behörighet för denna åtgärd',
        originalError: error,
        context,
        timestamp
      };
    }
    
    if (error?.code === 'PGRST301' || error?.message?.includes('RLS')) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: 'Du har inte behörighet för denna åtgärd',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Network errors
    if (error?.message?.includes('fetch') || error?.message?.includes('Failed to fetch') || error?.message?.includes('network')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Nätverksfel - försök igen',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Database errors
    if (error?.code === '23505' || error?.code?.startsWith('23') || error?.message?.includes('constraint') || error?.message?.includes('duplicate key')) {
      return {
        type: ErrorType.DATABASE,
        message: 'Databasfel - kontakta support',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Unknown errors
    return {
      type: ErrorType.UNKNOWN,
      message: 'Ett oväntat fel uppstod',
      originalError: error,
      context,
      timestamp
    };
  }

  private static showUserMessage(error: StructuredError) {
    switch (error.type) {
      case ErrorType.VALIDATION:
        toast.warning('Valideringsfel', {
          description: error.message
        });
        break;
      case ErrorType.AUTHENTICATION:
        toast.error('Autentiseringsfel', {
          description: error.message
        });
        break;
      case ErrorType.AUTHORIZATION:
        toast.error(error.message, { duration: 5000 });
        break;
      case ErrorType.PERMISSION:
        toast.error('Behörighetsfel', {
          description: 'Du har inte behörighet för denna åtgärd'
        });
        break;
      case ErrorType.NETWORK:
        toast.error('Nätverksfel', {
          description: 'Kontrollera din anslutning och försök igen'
        });
        break;
      case ErrorType.DATABASE:
        toast.error('Databasfel', {
          description: 'Denna data finns redan eller är ogiltig'
        });
        break;
      case ErrorType.UNKNOWN:
      default:
        toast.error('Oväntat fel', {
          description: 'Ett oväntat fel uppstod. Försök igen senare.'
        });
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
