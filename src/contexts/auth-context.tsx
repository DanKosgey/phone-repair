"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/server/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

// Simple in-memory cache for user roles
const roleCache = new Map<string, { role: string | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  isLoading: boolean;
  isFetchingRole: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  isSessionValid: () => Promise<boolean>;
  recoverSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingRole, setIsFetchingRole] = useState(false);
  
  // Refs to prevent infinite loops and memory leaks
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);
  const roleAbortControllerRef = useRef<AbortController | null>(null);
  const pendingTimeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const retryAttemptsRef = useRef<Map<string, number>>(new Map());
  const lastFetchedUserIdRef = useRef<string | null>(null);
  
  // Get Supabase client instance (stable reference)
  const supabaseRef = useRef(getSupabaseBrowserClient());
  const supabase = supabaseRef.current;

  // Suppress Cloudflare cookie warnings in console
  useEffect(() => {
    // Suppress Cloudflare cookie warnings in console
    const originalError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('__cf_bm') || 
         args[0].includes('invalid domain') ||
         args[0].includes('Cookie'))
      ) {
        // Suppress these warnings
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  // Cleanup helper for timeouts
  const clearAllTimeouts = useCallback(() => {
    pendingTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    pendingTimeoutsRef.current.clear();
  }, []);

  // Safe timeout that tracks itself
  const safeSetTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        callback();
      }
      pendingTimeoutsRef.current.delete(timeout);
    }, delay);
    pendingTimeoutsRef.current.add(timeout);
    return timeout;
  }, []);

  // Fetch user role with proper cleanup and error handling
  const fetchUserRole = useCallback(async (userId: string): Promise<void> => {
    if (!userId || !isMountedRef.current) return;

    // Prevent re-fetching for the same user
    if (lastFetchedUserIdRef.current === userId && isFetchingRole) {
      logger.log('AuthProvider: Role fetch already in progress for this user');
      return;
    }

    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.log('AuthProvider: Using cached role');
      setRole(cached.role);
      lastFetchedUserIdRef.current = userId;
      return;
    }

    // Cancel any pending role fetch
    if (roleAbortControllerRef.current) {
      roleAbortControllerRef.current.abort();
    }

    roleAbortControllerRef.current = new AbortController();
    const currentAbortController = roleAbortControllerRef.current;

    setIsFetchingRole(true);
    lastFetchedUserIdRef.current = userId;
    logger.log('AuthProvider: Fetching role for user');
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .abortSignal(currentAbortController.signal)
        .single();

      // Check if this request was aborted
      if (currentAbortController.signal.aborted || !isMountedRef.current) {
        logger.log('AuthProvider: Role fetch was aborted or component unmounted');
        return;
      }

      if (error) {
        logger.error('AuthProvider: Error fetching user role:', error.message);
        
        // Handle network errors with exponential backoff
        if (error.code === 'PGRST301' || error.message.includes('timeout') || error.message.includes('network')) {
          const retryCount = retryAttemptsRef.current.get(userId) || 0;
          const maxRetries = 3;
          
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000;
            logger.log(`AuthProvider: Retry attempt ${retryCount + 1}/${maxRetries} in ${delay}ms`);
            
            retryAttemptsRef.current.set(userId, retryCount + 1);
            
            safeSetTimeout(() => {
              if (isMountedRef.current) {
                setIsFetchingRole(false);
                lastFetchedUserIdRef.current = null;
                fetchUserRole(userId);
              }
            }, delay);
            return;
          } else {
            logger.error('AuthProvider: Max retries exceeded');
            retryAttemptsRef.current.delete(userId);
          }
        }
        
        setRole(null);
      } else {
        // Success - clear retry count
        retryAttemptsRef.current.delete(userId);
        
        const userRole = data?.role || null;
        logger.log('AuthProvider: User role fetched successfully:', userRole);
        setRole(userRole);
        roleCache.set(userId, { role: userRole, timestamp: Date.now() });
      }
    } catch (error: any) {
      if (error.name === 'AbortError' || !isMountedRef.current) {
        logger.log('AuthProvider: Role fetch aborted');
        return;
      }
      
      logger.error('AuthProvider: Exception during role fetching:', error.message);
      setRole(null);
    } finally {
      if (isMountedRef.current) {
        setIsFetchingRole(false);
      }
    }
  }, [isFetchingRole, supabase, safeSetTimeout]);

  // Initialize authentication - ONLY RUNS ONCE
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current) {
      return;
    }
    
    isInitializedRef.current = true;
    logger.log('AuthProvider: Initializing authentication');
    
    const initAuth = async () => {
      try {
        // Check if user just signed out (check a flag in sessionStorage)
        if (typeof window !== 'undefined') {
          const justSignedOut = sessionStorage.getItem('just_signed_out');
          if (justSignedOut) {
            sessionStorage.removeItem('just_signed_out');
            logger.log('AuthProvider: User just signed out, skipping session restoration');
            setUser(null);
            setSession(null);
            setRole(null);
            setIsLoading(false);
            return;
          }
        }
        
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('AuthProvider: Error getting session:', error.message);
          if (error.message === 'Auth session missing!') {
            logger.warn('AuthProvider: Auth session missing during initialization');
            setUser(null);
            setSession(null);
            setRole(null);
          }
        } else if (currentSession?.user) {
          logger.log('AuthProvider: Setting user from session');
          setUser(currentSession.user);
          setSession(currentSession);
          await fetchUserRole(currentSession.user.id);
        } else {
          logger.log('AuthProvider: No active session found');
        }
      } catch (error: any) {
        logger.error('AuthProvider: Error initializing auth:', error.message);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logger.log('AuthProvider: Auth state changed:', event);
        
        if (!isMountedRef.current) return;

        switch (event) {
          case 'SIGNED_IN':
            if (currentSession?.user) {
              setUser(currentSession.user);
              setSession(currentSession);
              lastFetchedUserIdRef.current = null; // Reset to allow fetch
              await fetchUserRole(currentSession.user.id);
            }
            setIsLoading(false);
            break;
            
          case 'TOKEN_REFRESHED':
            if (currentSession?.user) {
              setUser(currentSession.user);
              setSession(currentSession);
              // Don't re-fetch role on token refresh if we already have it
              if (!role) {
                lastFetchedUserIdRef.current = null;
                await fetchUserRole(currentSession.user.id);
              }
            }
            setIsLoading(false);
            break;
            
          case 'SIGNED_OUT':
            setUser(null);
            setSession(null);
            setRole(null);
            roleCache.clear();
            retryAttemptsRef.current.clear();
            lastFetchedUserIdRef.current = null;
            setIsLoading(false);
            break;
            
          case 'USER_UPDATED':
            if (currentSession?.user) {
              setUser(currentSession.user);
              setSession(currentSession);
            }
            setIsLoading(false);
            break;

          case 'INITIAL_SESSION':
            // Ignore INITIAL_SESSION as it's handled by initAuth
            break;
            
          default:
            setIsLoading(false);
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty deps - only run once

  // Session auto-refresh
  useEffect(() => {
    if (!session?.expires_at) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = session.expires_at - now;
    
    // Refresh 5 minutes before expiry
    const refreshTime = Math.max((timeUntilExpiry - 300) * 1000, 60000);
    
    const refreshTimer = safeSetTimeout(async () => {
      if (!isMountedRef.current) return;
      
      try {
        logger.log('AuthProvider: Auto-refreshing session');
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        
        if (error) {
          logger.error('AuthProvider: Error during auto-refresh:', error.message);
        } else if (refreshedSession && isMountedRef.current) {
          setSession(refreshedSession);
          setUser(refreshedSession.user);
        }
      } catch (error: any) {
        logger.error('AuthProvider: Exception during auto-refresh:', error.message);
      }
    }, refreshTime);
    
    return () => {
      clearTimeout(refreshTimer);
      pendingTimeoutsRef.current.delete(refreshTimer);
    };
  }, [session?.expires_at, supabase, safeSetTimeout]);

  // Sign in
  const signIn = async (email: string, password: string): Promise<void> => {
    logger.log('AuthProvider: Attempting sign in');
    setIsLoading(true);
    
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!password) {
        throw new Error('Password is required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('AuthProvider: Sign in error:', error.message);
        switch (error.message) {
          case 'Invalid login credentials':
            throw new Error('Invalid email or password');
          case 'Email not confirmed':
            throw new Error('Please confirm your email address before signing in');
          default:
            throw new Error('Authentication failed. Please try again.');
        }
      }

      if (data.user && isMountedRef.current) {
        logger.log('AuthProvider: Sign in successful');
        setUser(data.user);
        setSession(data.session);
        
        // Reset fetch tracker
        lastFetchedUserIdRef.current = null;
        
        // Fetch role with timeout
        const timeoutPromise = new Promise<void>((resolve) => {
          safeSetTimeout(() => {
            logger.warn('AuthProvider: Role fetch timeout');
            resolve();
          }, 5000);
        });
        
        await Promise.race([
          fetchUserRole(data.user.id),
          timeoutPromise
        ]);
      } else if (!data.user) {
        throw new Error('Authentication failed. No user data received.');
      }
    } catch (error: any) {
      logger.error('AuthProvider: Sign in error:', error.message);
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      logger.log('AuthProvider: Signing out');
      setIsLoading(true);
      
      // Set flag to prevent auto re-login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('just_signed_out', 'true');
      }
      
      // Clear all pending operations
      clearAllTimeouts();
      if (roleAbortControllerRef.current) {
        roleAbortControllerRef.current.abort();
      }
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      setRole(null);
      roleCache.clear();
      retryAttemptsRef.current.clear();
      lastFetchedUserIdRef.current = null;
      
      // Sign out from Supabase with global scope
      try {
        const { error } = await supabase.auth.signOut({
          scope: 'global'
        });
        
        if (error && error.message !== 'Auth session missing!') {
          logger.error('AuthProvider: Error during sign out:', error.message);
        }
      } catch (err) {
        logger.error('AuthProvider: Exception during sign out:', err);
      }
      
      // Clear all browser storage
      if (typeof window !== 'undefined') {
        // Clear localStorage
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          });
        } catch (err) {
          logger.error('Failed to clear localStorage:', err);
        }
        
        // Clear sessionStorage (except our flag)
        try {
          Object.keys(sessionStorage).forEach(key => {
            if ((key.startsWith('sb-') || key.includes('supabase')) && key !== 'just_signed_out') {
              sessionStorage.removeItem(key);
            }
          });
        } catch (err) {
          logger.error('Failed to clear sessionStorage:', err);
        }
        
        // Clear auth cookies
        try {
          document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
              // Clear with different path and domain combinations
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
            }
          });
        } catch (err) {
          logger.error('Failed to clear cookies:', err);
        }
      }
      
      logger.log('AuthProvider: Sign out completed, all data cleared');
    } catch (error: any) {
      logger.error('AuthProvider: Error signing out:', error.message);
      // Ensure state is cleared even on error
      setUser(null);
      setSession(null);
      setRole(null);
      lastFetchedUserIdRef.current = null;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Refresh session
  const refreshSession = useCallback(async (): Promise<Session | null> => {
    try {
      logger.log('AuthProvider: Refreshing session');
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        if (error.message === 'Auth session missing!') {
          logger.warn('AuthProvider: Auth session missing during refresh');
          setUser(null);
          setSession(null);
          setRole(null);
          lastFetchedUserIdRef.current = null;
          return null;
        }
        logger.error('AuthProvider: Error during session refresh:', error.message);
        throw error;
      }
      
      if (refreshedSession && isMountedRef.current) {
        logger.log('AuthProvider: Session refreshed successfully');
        setUser(refreshedSession.user);
        setSession(refreshedSession);
        
        // Only fetch role if we don't have it
        if (!role) {
          lastFetchedUserIdRef.current = null;
          await fetchUserRole(refreshedSession.user.id);
        }
        return refreshedSession;
      }
      
      return null;
    } catch (error: any) {
      logger.error('AuthProvider: Error refreshing session:', error.message);
      throw error;
    }
  }, [supabase, fetchUserRole, role]);

  // Recover session
  const recoverSession = useCallback(async (): Promise<boolean> => {
    try {
      logger.log('AuthProvider: Attempting session recovery');
      
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('AuthProvider: Error during session recovery:', error.message);
        return false;
      }
      
      if (currentSession?.user && isMountedRef.current) {
        logger.log('AuthProvider: Session recovered');
        setUser(currentSession.user);
        setSession(currentSession);
        lastFetchedUserIdRef.current = null;
        await fetchUserRole(currentSession.user.id);
        return true;
      }
      
      logger.log('AuthProvider: No session to recover');
      return false;
    } catch (error: any) {
      logger.error('AuthProvider: Exception during session recovery:', error.message);
      return false;
    }
  }, [supabase, fetchUserRole]);

  // Check session validity
  const isSessionValid = useCallback(async (): Promise<boolean> => {
    try {
      logger.log('AuthProvider: Checking session validity');
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('AuthProvider: Error checking session validity:', error.message);
        return false;
      }
      
      if (!currentSession) {
        logger.log('AuthProvider: No active session found');
        return false;
      }
      
      if (currentSession.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (currentSession.expires_at <= now) {
          logger.log('AuthProvider: Session has expired, attempting recovery');
          return await recoverSession();
        }
      }
      
      logger.log('AuthProvider: Session is valid');
      return true;
    } catch (error: any) {
      logger.error('AuthProvider: Error validating session:', error.message);
      return false;
    }
  }, [supabase, recoverSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearAllTimeouts();
      if (roleAbortControllerRef.current) {
        roleAbortControllerRef.current.abort();
      }
      retryAttemptsRef.current.clear();
      logger.log('AuthProvider: Cleaning up');
    };
  }, [clearAllTimeouts]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isLoading,
        isFetchingRole,
        signIn,
        signOut,
        refreshSession,
        isSessionValid,
        recoverSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};