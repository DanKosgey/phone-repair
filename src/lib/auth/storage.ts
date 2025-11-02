/**
 * Secure storage utilities for authentication-related data
 * Note: Supabase handles token storage securely via httpOnly cookies
 * This utility is for storing non-sensitive user preferences or UI state
 */

/**
 * Store a value in sessionStorage (cleared when tab is closed)
 * @param key - The key to store the value under
 * @param value - The value to store (will be JSON.stringify'd)
 */
export function setSessionStorage(key: string, value: any): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting sessionStorage:', error);
    }
  }
}

/**
 * Get a value from sessionStorage
 * @param key - The key to retrieve
 * @returns The stored value or null if not found
 */
export function getSessionStorage(key: string): any {
  if (typeof window !== 'undefined') {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting sessionStorage:', error);
      return null;
    }
  }
  return null;
}

/**
 * Remove a value from sessionStorage
 * @param key - The key to remove
 */
export function removeSessionStorage(key: string): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing sessionStorage:', error);
    }
  }
}

/**
 * Clear all sessionStorage
 */
export function clearSessionStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  }
}

/**
 * Store a value in localStorage (persists until manually cleared)
 * @param key - The key to store the value under
 * @param value - The value to store (will be JSON.stringify'd)
 */
export function setLocalStorage(key: string, value: any): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }
}

/**
 * Get a value from localStorage
 * @param key - The key to retrieve
 * @returns The stored value or null if not found
 */
export function getLocalStorage(key: string): any {
  if (typeof window !== 'undefined') {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting localStorage:', error);
      return null;
    }
  }
  return null;
}

/**
 * Remove a value from localStorage
 * @param key - The key to remove
 */
export function removeLocalStorage(key: string): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage:', error);
    }
  }
}

/**
 * Clear all localStorage
 */
export function clearLocalStorage(): void {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}