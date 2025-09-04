import { toast } from "sonner";

// Error types for better categorization
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
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
    
    // Supabase auth errors
    if (error?.message?.includes('Invalid login credentials')) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: 'Felaktiga inloggningsuppgifter',
        originalError: error,
        context,
        timestamp
      };
    }
    
    if (error?.message?.includes('Email already registered')) {
      return {
        type: ErrorType.VALIDATION,
        message: 'Ett konto med denna email finns redan',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Database/RLS errors
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
    if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Nätverksfel - försök igen',
        originalError: error,
        context,
        timestamp
      };
    }
    
    // Database errors
    if (error?.code?.startsWith('23') || error?.message?.includes('constraint')) {
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
      message: error?.message || 'Ett oväntat fel uppstod',
      originalError: error,
      context,
      timestamp
    };
  }

  private static showUserMessage(error: StructuredError) {
    switch (error.type) {
      case ErrorType.VALIDATION:
      case ErrorType.AUTHENTICATION:
        toast.error(error.message);
        break;
      case ErrorType.AUTHORIZATION:
        toast.error(error.message, { duration: 5000 });
        break;
      case ErrorType.NETWORK:
        toast.error(error.message, { 
          duration: 4000,
          action: {
            label: "Försök igen",
            onClick: () => window.location.reload()
          }
        });
        break;
      case ErrorType.DATABASE:
        toast.error(error.message, { duration: 6000 });
        break;
      default:
        toast.error(error.message);
    }
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
