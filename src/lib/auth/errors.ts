/**
 * Authentication error codes and messages
 */

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_NOT_FOUND: 'user_not_found',
  WRONG_PASSWORD: 'wrong_password',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  USER_ALREADY_EXISTS: 'user_already_exists',
  WEAK_PASSWORD: 'weak_password',
  SESSION_EXPIRED: 'session_expired',
  UNAUTHORIZED: 'unauthorized',
  FORBIDDEN: 'forbidden',
  NETWORK_ERROR: 'network_error',
  UNKNOWN_ERROR: 'unknown_error'
} as const;

export const AUTH_ERROR_MESSAGES = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'User not found',
  [AUTH_ERROR_CODES.WRONG_PASSWORD]: 'Incorrect password',
  [AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED]: 'Please confirm your email address',
  [AUTH_ERROR_CODES.USER_ALREADY_EXISTS]: 'User already exists',
  [AUTH_ERROR_CODES.WEAK_PASSWORD]: 'Password is too weak',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  [AUTH_ERROR_CODES.UNAUTHORIZED]: 'You need to log in to access this resource',
  [AUTH_ERROR_CODES.FORBIDDEN]: 'You do not have permission to access this resource',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection',
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred'
} as const;

/**
 * Handle authentication errors and return user-friendly messages
 * @param error - The error object from Supabase
 * @returns A user-friendly error message
 */
export function handleAuthError(error: any): string {
  // If it's already a string, return it
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Supabase auth errors
  if (error?.code) {
    switch (error.code) {
      case 'invalid_grant':
        return AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS];
      case 'user_not_found':
        return AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.USER_NOT_FOUND];
      case 'wrong_password':
        return AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.WRONG_PASSWORD];
      case 'email_not_confirmed':
        return AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.EMAIL_NOT_CONFIRMED];
      case 'user_already_exists':
        return AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.USER_ALREADY_EXISTS];
      default:
        return error.message || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR];
    }
  }
  
  // Handle network errors
  if (error?.message?.includes('NetworkError') || error?.message?.includes('Failed to fetch')) {
    return AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.NETWORK_ERROR];
  }
  
  // Return the error message if available, otherwise default message
  return error?.message || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR];
}

/**
 * Check if an error is an authentication error
 * @param error - The error to check
 * @returns boolean
 */
export function isAuthError(error: any): boolean {
  return error?.name === 'AuthError' || 
         error?.code?.startsWith('auth/') ||
         Object.values(AUTH_ERROR_CODES).includes(error?.code);
}