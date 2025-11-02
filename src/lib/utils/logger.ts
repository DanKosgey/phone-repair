// src/lib/utils/logger.ts
// Utility for controlled logging that can be disabled in production

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[LOG] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // Always log errors, but sanitize sensitive data
    console.error(`[ERROR] ${message}`, ...args.map(arg => {
      // Don't log full objects in production to prevent exposing sensitive data
      if (!isDevelopment && typeof arg === 'object' && arg !== null) {
        return '[REDACTED]';
      }
      return arg;
    }));
  }
};