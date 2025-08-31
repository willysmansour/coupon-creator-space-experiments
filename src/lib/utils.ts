import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Base URL utility
export const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  
  // Force HTTPS in production
  if (window.location.protocol === 'https:') {
    return `https://${window.location.host}`;
  }
  
  return window.location.origin;
};
