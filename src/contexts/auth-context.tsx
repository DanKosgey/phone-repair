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
  const supabaseRef = useRef<ReturnType<typeof getSupabaseBrowserClient> | null>(null);
  
  // Initialize Supabase client safely - only once
  if (!supabaseRef.current) {
    try {
      supabaseRef.current = getSupabaseBrowserClient();
    } catch (error) {
      console.warn('Failed to initialize Supabase client:', error);
      supabaseRef.current = null;
    }
  }

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
    console.log('AuthProvider: Fetching role for user', userId);
    
    if (!userId || !isMountedRef.current) {
      console.log('AuthProvider: Skipping role fetch - no userId or not mounted');
      return;
    }

    // Cancel any pending role fetch
    if (roleAbortControllerRef.current) {
      console.log('AuthProvider: Aborting previous role fetch');
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

      console.log('AuthProvider: Making Supabase request for role');
      // Use maybeSingle() instead of single() to handle cases where profile doesn't exist yet
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .abortSignal(currentAbortController.signal)
        .maybeSingle(); // Changed from .single() to .maybeSingle()

      // Check if this request was aborted
      if (currentAbortController.signal.aborted || !isMountedRef.current) {
        console.log('AuthProvider: Role fetch was aborted or component unmounted');
        return;
      }

      console.log('AuthProvider: Role fetch response', { data, error });
      
      if (error) {
        console.error('AuthProvider: Error fetching user role:', error.message);
        // Even on error, we continue with null role to prevent blocking the flow
        if (isMountedRef.current) {
          setRole(null);
        }
      } else {
        // data might be null if profile doesn't exist, which is handled gracefully
        const userRole = data?.role || null; // Keep null if no role found
        console.log('AuthProvider: Setting user role', userRole);
        if (isMountedRef.current) {
          setRole(userRole);
          console.log('AuthProvider: Role set in state', userRole);
        }
      }
    } catch (error: any) {
      console.error('AuthProvider: Exception during role fetching:', error.message);
      // Even on exception, we continue with null role to prevent blocking the flow
      if (isMountedRef.current) {
        setRole(null); // Keep null on error
      }
    } finally {
      if (isMountedRef.current) {
        setIsFetchingRole(false);
        console.log('AuthProvider: Finished fetching role, isFetchingRole set to false');
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
        console.log('AuthProvider: Already initialized, setting loading to false');
        setIsLoading(false);
      }
      return;
    }
    
    isInitializedRef.current = true;
    logger.log('AuthProvider: Initializing authentication');
    console.log('AuthProvider: Starting initialization');
    
    // Add a timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        logger.warn('AuthProvider: Initialization timeout, setting loading to false');
        console.log('AuthProvider: Initialization timeout, setting loading to false');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    
    // Listen to auth changes (only if we have a Supabase client)
    if (supabase) {
      console.log('AuthProvider: Setting up auth state change listener');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, currentSession) => {
          logger.log('AuthProvider: Auth state changed:', event, currentSession?.user?.id);
          console.log('AuthProvider: Auth state changed:', event, currentSession?.user?.id);
          
          if (!isMountedRef.current) {
            console.log('AuthProvider: Component not mounted, skipping auth state change');
            return;
          }

          switch (event) {
            case 'SIGNED_IN':
              if (currentSession?.user) {
                console.log('AuthProvider: User signed in', currentSession.user.id);
                setUser(currentSession.user);
                setSession(currentSession);
                
                // Fetch role with improved handling during sign in
                if (isMountedRef.current) {
                  console.log('AuthProvider: Fetching role for signed in user');
                  fetchUserRole(currentSession.user.id);
                }
              }
              if (isMountedRef.current) {
                console.log('AuthProvider: Setting loading to false after SIGNED_IN');
                setIsLoading(false);
              }
              break;
              
            case 'TOKEN_REFRESHED':
              if (currentSession?.user) {
                console.log('AuthProvider: Token refreshed', currentSession.user.id);
                setUser(currentSession.user);
                setSession(currentSession);
              }
              if (isMountedRef.current) {
                console.log('AuthProvider: Setting loading to false after TOKEN_REFRESHED');
                setIsLoading(false);
              }
              break;
              
            case 'SIGNED_OUT':
              console.log('AuthProvider: User signed out');
              setUser(null);
              setSession(null);
              setRole(null);
              if (isMountedRef.current) {
                console.log('AuthProvider: Setting loading to false after SIGNED_OUT');
                setIsLoading(false);
              }
              break;
              
            case 'USER_UPDATED':
              if (currentSession?.user) {
                console.log('AuthProvider: User updated', currentSession.user.id);
                setUser(currentSession.user);
                setSession(currentSession);
              }
              if (isMountedRef.current) {
                console.log('AuthProvider: Setting loading to false after USER_UPDATED');
                setIsLoading(false);
              }
              break;

            case 'INITIAL_SESSION':
              // Handle INITIAL_SESSION to restore session on page load
              logger.log('AuthProvider: Processing INITIAL_SESSION event');
              console.log('AuthProvider: Processing INITIAL_SESSION event', currentSession?.user?.id);
              if (currentSession?.user) {
                logger.log('AuthProvider: Restoring session from INITIAL_SESSION');
                console.log('AuthProvider: Restoring session from INITIAL_SESSION', currentSession.user.id);
                setUser(currentSession.user);
                setSession(currentSession);
                
                // Fetch role with improved handling
                if (isMountedRef.current) {
                  console.log('AuthProvider: Fetching role for restored session');
                  fetchUserRole(currentSession.user.id);
                }
              } else {
                logger.log('AuthProvider: No initial session found');
                console.log('AuthProvider: No initial session found');
              }
              if (isMountedRef.current) {
                console.log('AuthProvider: Setting loading to false after INITIAL_SESSION');
                setIsLoading(false);
              }
              break;
              
            default:
              logger.log('AuthProvider: Unhandled auth event:', event);
              console.log('AuthProvider: Unhandled auth event:', event);
              if (isMountedRef.current) {
                console.log('AuthProvider: Setting loading to false after unhandled event');
                setIsLoading(false);
              }
              break;
          }
        }
      );

      return () => {
        console.log('AuthProvider: Cleaning up auth state change listener');
        subscription.unsubscribe();
        if (initTimeout) {
          clearTimeout(initTimeout);
        }
      };
    } else {
      // If no Supabase client, set loading to false
      if (isMountedRef.current) {
        console.log('AuthProvider: No Supabase client, setting loading to false');
        setIsLoading(false);
      }
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    }
  }, []); // Empty dependency array to ensure this only runs once

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
    console.log('AuthProvider: Attempting sign in for email', email);
    
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

      console.log('AuthProvider: Calling Supabase signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('AuthProvider: Supabase signInWithPassword response', { data, error });

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
        console.log('AuthProvider: Setting user and session', { 
          userId: data.user.id,
          session: data.session 
        });
        setUser(data.user);
        setSession(data.session);
        
        // Don't call fetchUserRole here since it's already being called in the SIGNED_IN event handler
        // Add a small delay to ensure state is properly set before any potential redirect
        console.log('AuthProvider: Waiting for state to settle');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Increased from 300ms to 1000ms
        console.log('AuthProvider: State settled, sign in complete');
      } else if (!data.user) {
        throw new Error('Authentication failed. No user data received.');
      }
    } catch (error: any) {
      logger.error('AuthProvider: Sign in error:', error.message);
      console.error('AuthProvider: Sign in error:', error);
      throw error;
    } finally {
      // Ensure loading state is reset in all cases
      if (isMountedRef.current) {
        setIsLoading(false);
      }
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