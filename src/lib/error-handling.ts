// Error handling utilities to replace console statements
import { notify } from '@/lib/notify';

export interface ErrorWithMessage {
  message: string;
  status?: number;
  code?: string;
}

export function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(maybeError: unknown): string {
  return toErrorWithMessage(maybeError).message;
}

// Safe error logging - only logs in development
export function logError(message: string, error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error, context);
  }
  
  // In production, you might want to send to an error reporting service
  // like Sentry, LogRocket, etc.
}

// User-friendly error handling
export function handleError(error: unknown, userMessage: string): void {
  const errorMessage = getErrorMessage(error);
  
  // Log error for developers
  logError(userMessage, error);
  
  // Show user-friendly message
  notify.error(userMessage);
}

// API error handling
export function handleApiError(error: unknown, operation: string): void {
  const errorMessage = getErrorMessage(error);
  
  // Log error for developers
  logError(`API Error in ${operation}`, error);
  
  // Show user-friendly message
  notify.error(`Failed to ${operation}. Please try again.`);
}

// Validation error handling
export function handleValidationError(error: unknown, field: string): void {
  const errorMessage = getErrorMessage(error);
  
  // Log error for developers
  logError(`Validation Error in ${field}`, error);
  
  // Show user-friendly message
  notify.error(`Please check your ${field} and try again.`);
}

// Upload error handling
export function handleUploadError(error: unknown, fileType: string): void {
  const errorMessage = getErrorMessage(error);
  
  // Log error for developers
  logError(`Upload Error for ${fileType}`, error);
  
  // Show user-friendly message
  notify.error(`Failed to upload ${fileType}. Please try again.`);
}

// Authentication error handling
export function handleAuthError(error: unknown, operation: string): void {
  const errorMessage = getErrorMessage(error);
  
  // Log error for developers
  logError(`Auth Error in ${operation}`, error);
  
  // Show user-friendly message
  notify.error(`Authentication failed. Please try again.`);
}
