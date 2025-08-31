import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ Fix: Base URL and mobile utilities
export const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  
  // Force HTTPS in production
  if (window.location.protocol === 'https:') {
    return `https://${window.location.host}`;
  }
  
  return window.location.origin;
};

export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isOnline = () => {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
};

export const getNetworkInfo = () => {
  if (typeof window === 'undefined') return { 
    isMobile: false, 
    isOnline: true, 
    protocol: 'unknown',
    baseUrl: ''
  };
  
  return {
    isMobile: isMobile(),
    isOnline: isOnline(),
    protocol: window.location.protocol,
    userAgent: navigator.userAgent,
    baseUrl: getBaseUrl()
  };
};
