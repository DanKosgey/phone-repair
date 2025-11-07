"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/server/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { logger } from '@/lib/utils/logger';

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
  
  // Get Supabase client instance (stable reference)
  const supabaseRef = useRef<ReturnType<typeof getSupabaseBrowserClient> | null>(null);
  
  // Initialize Supabase client safely
  useEffect(() => {
    try {
      supabaseRef.current = getSupabaseBrowserClient();
    } catch (error) {
      console.warn('Failed to initialize Supabase client:', error);
      supabaseRef.current = null;
    }
  }, []);

  const supabase = supabaseRef.current;

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

    // Cancel any pending role fetch
    if (roleAbortControllerRef.current) {
      roleAbortControllerRef.current.abort();
    }

    roleAbortControllerRef.current = new AbortController();
    const currentAbortController = roleAbortControllerRef.current;

    if (isMountedRef.current) {
      setIsFetchingRole(true);
    }
    
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Use maybeSingle() instead of single() to handle cases where profile doesn't exist yet
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .abortSignal(currentAbortController.signal)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      // Check if this request was aborted
      if (currentAbortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      if (error) {
        console.error('AuthProvider: Error fetching user role:', error.message);
        // Even on error, we continue with null role to prevent blocking the flow
        if (isMountedRef.current) {
          setRole(null);
        }
      } else {
        // data might be null if profile doesn't exist, which is handled gracefully
        const userRole = data?.role || null;
        if (isMountedRef.current) {
          setRole(userRole);
        }
      }
    } catch (error: any) {
      console.error('AuthProvider: Exception during role fetching:', error.message);
      // Even on exception, we continue with null role to prevent blocking the flow
      if (isMountedRef.current) {
        setRole(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsFetchingRole(false);
      }
      // Clean up abort controller
      if (roleAbortControllerRef.current === currentAbortController) {
        roleAbortControllerRef.current = null;
      }
    }
  }, [supabase]);

  // Initialize authentication - ONLY RUNS ONCE
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current || !supabase) {
      // Make sure to set loading to false if we're not initializing
      if (isMountedRef.current && isLoading) {
        setIsLoading(false)
      }
      return
    }
    
    isInitializedRef.current = true
    logger.log('AuthProvider: Initializing authentication')
    
    // Add a timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        logger.warn('AuthProvider: Initialization timeout, setting loading to false')
        setIsLoading(false)
      }
    }, 5000) // 5 second timeout
    
    const initAuth = async () => {
      try {
        // Check if user just signed out (check a flag in sessionStorage)
        if (typeof window !== 'undefined') {
          const justSignedOut = sessionStorage.getItem('just_signed_out')
          if (justSignedOut) {
            sessionStorage.removeItem('just_signed_out')
            logger.log('AuthProvider: User just signed out, skipping session restoration')
            setUser(null)
            setSession(null)
            setRole(null)
            if (isMountedRef.current) {
              setIsLoading(false)
            }
            return
          }
        }
        
        // Try to get session from Supabase with a timeout
        const getSessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 3000)
        )
        
        const { data: { session: currentSession }, error } = await Promise.race([
          getSessionPromise,
          timeoutPromise
        ]) as any

        if (error) {
          logger.error('AuthProvider: Error getting session:', error.message)
          if (error.message === 'Auth session missing!') {
            logger.warn('AuthProvider: Auth session missing during initialization')
            setUser(null)
            setSession(null)
            setRole(null)
          }
        } else if (currentSession?.user) {
          logger.log('AuthProvider: Setting user from session')
          setUser(currentSession.user)
          setSession(currentSession)
          
          // Fetch role with improved handling during initialization
          if (isMountedRef.current) {
            fetchUserRole(currentSession.user.id)
          }
        } else {
          logger.log('AuthProvider: No active session found')
        }
      } catch (error: any) {
        logger.error('AuthProvider: Error initializing auth:', error.message)
        // Even on error, ensure we're not stuck in loading state
        if (isMountedRef.current) {
          setUser(null)
          setSession(null)
          setRole(null)
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false)
        }
        if (initTimeout) {
          clearTimeout(initTimeout)
        }
      }
    }

    // Only run initialization if we have a Supabase client
    if (supabase) {
      initAuth()
    } else {
      // If no Supabase client, set loading to false
      if (isMountedRef.current) {
        setIsLoading(false)
      }
      if (initTimeout) {
        clearTimeout(initTimeout)
      }
    }

    // Listen to auth changes (only if we have a Supabase client)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          logger.log('AuthProvider: Auth state changed:', event)
          
          if (!isMountedRef.current) return

          switch (event) {
            case 'SIGNED_IN':
              if (currentSession?.user) {
                setUser(currentSession.user)
                setSession(currentSession)
                
                // Fetch role with improved handling during sign in
                if (isMountedRef.current) {
                  fetchUserRole(currentSession.user.id)
                }
              }
              if (isMountedRef.current) {
                setIsLoading(false)
              }
              break
              
            case 'TOKEN_REFRESHED':
              if (currentSession?.user) {
                setUser(currentSession.user)
                setSession(currentSession)
              }
              if (isMountedRef.current) {
                setIsLoading(false)
              }
              break
              
            case 'SIGNED_OUT':
              setUser(null)
              setSession(null)
              setRole(null)
              if (isMountedRef.current) {
                setIsLoading(false)
              }
              break
              
            case 'USER_UPDATED':
              if (currentSession?.user) {
                setUser(currentSession.user)
                setSession(currentSession)
              }
              if (isMountedRef.current) {
                setIsLoading(false)
              }
              break

            case 'INITIAL_SESSION':
              // Ignore INITIAL_SESSION as it's handled by initAuth
              break
              
            default:
              if (isMountedRef.current) {
                setIsLoading(false)
              }
              break
          }
        }
      )

      return () => {
        subscription.unsubscribe()
        if (initTimeout) {
          clearTimeout(initTimeout)
        }
      }
    } else {
      // If no Supabase client, set loading to false
      if (isMountedRef.current) {
        setIsLoading(false)
      }
      if (initTimeout) {
        clearTimeout(initTimeout)
      }
    }
  }, [supabase]) // Depend on supabase client

  // Session auto-refresh
  useEffect(() => {
    if (!session?.expires_at || !supabase) return;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = session.expires_at - now;
    
    // Refresh 5 minutes before expiry, but not sooner than 1 minute
    const refreshTime = Math.max((timeUntilExpiry - 300) * 1000, 60000);
    
    const refreshTimer = safeSetTimeout(async () => {
      if (!isMountedRef.current) return;
      
      try {
        logger.log('AuthProvider: Auto-refreshing session');
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        
        if (error) {
          logger.error('AuthProvider: Error during auto-refresh:', error.message);
          // If we get an auth error, clear the session
          if (error.message === 'Auth session missing!') {
            setUser(null);
            setSession(null);
            setRole(null);
          }
        } else if (refreshedSession && isMountedRef.current) {
          logger.log('AuthProvider: Session refreshed successfully');
          setUser(refreshedSession.user);
          setSession(refreshedSession);
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
    if (!supabase) {
      throw new Error('Supabase client not available');
    }
    
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
        
        // Fetch role with improved handling
        fetchUserRole(data.user.id);
        
        // Add a small delay to ensure state is properly set before any potential redirect
        await new Promise(resolve => setTimeout(resolve, 100));
      } else if (!data.user) {
        throw new Error('Authentication failed. No user data received.');
      }
    } catch (error: any) {
      logger.error('AuthProvider: Sign in error:', error.message);
      // Ensure loading state is reset on error
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      throw error;
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    if (!supabase) {
      // If supabase isn't available, just clear local state
      setUser(null);
      setSession(null);
      setRole(null);
      return;
    }
    
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
        
        // Clear auth cookies properly
        try {
          // Get all cookies and filter for Supabase-related ones
          const cookies = document.cookie.split(';');
          
          cookies.forEach(cookie => {
            const name = cookie.trim().split('=')[0];
            if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
              // Remove cookie with proper domain and path handling
              const domain = window.location.hostname;
              try {
                document.cookie = `${name}=; path=/; max-age=0`;
                document.cookie = `${name}=; path=/; domain=${domain}; max-age=0`;
                document.cookie = `${name}=; path=/; domain=.${domain}; max-age=0`;
              } catch (removeError) {
                logger.error(`Failed to remove cookie ${name}:`, removeError);
              }
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
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Refresh session
  const refreshSession = useCallback(async (): Promise<Session | null> => {
    if (!supabase) {
      return null;
    }
    
    try {
      logger.log('AuthProvider: Refreshing session');
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        if (error.message === 'Auth session missing!') {
          logger.warn('AuthProvider: Auth session missing during refresh');
          setUser(null);
          setSession(null);
          setRole(null);
          return null;
        }
        logger.error('AuthProvider: Error during session refresh:', error.message);
        throw error;
      }
      
      if (refreshedSession && isMountedRef.current) {
        logger.log('AuthProvider: Session refreshed successfully');
        setUser(refreshedSession.user);
        setSession(refreshedSession);
        return refreshedSession;
      }
      
      return null;
    } catch (error: any) {
      logger.error('AuthProvider: Error refreshing session:', error.message);
      throw error;
    }
  }, [supabase]);

  // Recover session
  const recoverSession = useCallback(async (): Promise<boolean> => {
    if (!supabase) {
      return false;
    }
    
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
        return true;
      }
      
      logger.log('AuthProvider: No session to recover');
      return false;
    } catch (error: any) {
      logger.error('AuthProvider: Exception during session recovery:', error.message);
      return false;
    }
  }, [supabase]);

  // Check session validity
  const isSessionValid = useCallback(async (): Promise<boolean> => {
    if (!supabase) {
      return false;
    }
    
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
      
      // Check if session has expired
      if (currentSession.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (currentSession.expires_at <= now) {
          logger.log('AuthProvider: Session has expired');
          return false;
        }
      }
      
      logger.log('AuthProvider: Session is valid');
      return true;
    } catch (error: any) {
      logger.error('AuthProvider: Error validating session:', error.message);
      return false;
    }
  }, [supabase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearAllTimeouts();
      if (roleAbortControllerRef.current) {
        roleAbortControllerRef.current.abort();
      }
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