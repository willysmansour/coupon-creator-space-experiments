import { QueryClient } from "@tanstack/react-query";
import { ErrorHandler, ErrorType } from "./error-handler";

// Smart retry logic with exponential backoff
const smartRetry = (failureCount: number, error: any) => {
  // Don't retry validation or auth errors
  if (error?.message?.includes('Invalid login') || 
      error?.message?.includes('already exists') ||
      error?.code === 'PGRST301') {
    return false;
  }
  
  // Don't retry after 3 attempts
  if (failureCount >= 3) return false;
  
  // Retry network and unknown errors
  return true;
};

// Exponential backoff delay calculation
const getRetryDelay = (failureCount: number) => {
  return Math.min(1000 * 2 ** failureCount, 30000); // Max 30 seconds
};

// Optimized query options for better performance and error handling
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchOnReconnect: true,
      keepPreviousData: true,
      // Keep previous data on screen while refetching to avoid UI flash
      placeholderData: (prev) => prev,
      retry: smartRetry,
      retryDelay: getRetryDelay,
      throwOnError: false, // Handle errors gracefully
    },
    mutations: {
      retry: (failureCount, error) => {
        // Only retry network errors for mutations
        if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
          return failureCount < 2; // Max 2 retries for mutations
        }
        return false;
      },
      retryDelay: getRetryDelay,
      onError: (error, variables, context) => {
        // Centralized mutation error handling
        ErrorHandler.handle(error, { 
          type: 'mutation', 
          variables, 
          context 
        });
      }
    }
  }
});

// Domain-specific query options
export const authQueryOptions = {
  staleTime: 2 * 60 * 1000, // 2 minutes for auth data
  gcTime: 5 * 60 * 1000,
  retry: smartRetry,
  retryDelay: getRetryDelay
};

export const companyQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes for company data
  gcTime: 10 * 60 * 1000,
  retry: smartRetry,
  retryDelay: getRetryDelay
};

export const profileQueryOptions = {
  staleTime: 10 * 60 * 1000, // 10 minutes for profile data
  gcTime: 15 * 60 * 1000,
  retry: smartRetry,
  retryDelay: getRetryDelay
};
