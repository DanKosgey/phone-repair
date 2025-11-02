// src/lib/utils/csrf.ts
// CSRF protection utilities

// Generate a random CSRF token
export const generateCSRFToken = (): string => {
  // Generate a random string using crypto API if available, otherwise use Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto API
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
};

// Store CSRF token in sessionStorage
export const storeCSRFToken = (token: string): void => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
};

// Retrieve CSRF token from sessionStorage
export const getCSRFToken = (): string | null => {
  if (typeof sessionStorage !== 'undefined') {
    return sessionStorage.getItem('csrf_token');
  }
  return null;
};

// Remove CSRF token from sessionStorage
export const removeCSRFToken = (): void => {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem('csrf_token');
  }
};

// Validate CSRF token
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = getCSRFToken();
  return !!storedToken && storedToken === token;
};