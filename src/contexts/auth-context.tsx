"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingRole, setIsFetchingRole] = useState(false);
  
  // Get Supabase client instance
  const supabase = getSupabaseBrowserClient();

  // Check for cached role on mount
  useEffect(() => {
    if (user?.id) {
      const cached = roleCache.get(user.id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        logger.log('AuthProvider: Using cached role on mount for user:', user.id);
        setRole(cached.role);
      }
    }
  }, [user?.id]);

  // Memoize fetchUserRole to prevent recreation on every render
  const fetchUserRole = useCallback(async (userId: string) => {
    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.log('AuthProvider: Using cached role for user:', userId);
      setRole(cached.role);
      return;
    }

    // Prevent concurrent role fetches
    if (isFetchingRole) {
      logger.log('AuthProvider: Role fetch already in progress, skipping');
      return;
    }

    setIsFetchingRole(true);
    logger.log('AuthProvider: Fetching role for user:', userId);
    
    try {
      logger.log('AuthProvider: Querying profiles table for user ID:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      logger.log('AuthProvider: Profile query result:', { data: data ? '[REDACTED]' : null, hasError: !!error });
      logger.log('AuthProvider: Profile query error details:', error);

      if (error) {
        logger.error('AuthProvider: Error fetching user role:', error.message);
        logger.error('AuthProvider: Error code:', error.code);
        logger.error('AuthProvider: Error details:', error);
        
        // Handle specific error types
        if (error.code === 'PGRST301' || error.message.includes('timeout') || error.message.includes('network')) {
          // Network or timeout error - retry with exponential backoff
          logger.log('AuthProvider: Network error detected, implementing exponential backoff retry');
          const retryCount = roleCache.get(`retry_${userId}`)?.role ? parseInt(roleCache.get(`retry_${userId}`)?.role || '0') : 0;
          const maxRetries = 3;
          
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
            logger.log(`AuthProvider: Retry attempt ${retryCount + 1}/${maxRetries} in ${delay}ms`);
            
            // Store retry count
            roleCache.set(`retry_${userId}`, { role: (retryCount + 1).toString(), timestamp: Date.now() });
            
            setTimeout(async () => {
              setIsFetchingRole(false);
              await fetchUserRole(userId);
            }, delay);
            return;
          } else {
            logger.error('AuthProvider: Max retries exceeded for role fetching');
            // Clear retry count
            roleCache.delete(`retry_${userId}`);
          }
        }
        
        // In production, if we can't fetch the role, check if we can determine it from JWT
        if (session?.user?.role === 'admin') {
          logger.log('AuthProvider: Using role from JWT token');
          setRole('admin');
          // Cache the role
          roleCache.set(userId, { role: 'admin', timestamp: Date.now() });
        } else {
          // For other errors, retry once after 2 seconds
          logger.log('AuthProvider: Retrying role fetch in 2 seconds due to error');
          setTimeout(async () => {
            setIsFetchingRole(false);
            await fetchUserRole(userId);
          }, 2000);
          return;
        }
      } else {
        // Success - clear any retry count
        roleCache.delete(`retry_${userId}`);
        
        logger.log('AuthProvider: User role fetched:', data?.role ? '[REDACTED]' : null);
        setRole(data?.role || null);
        // Cache the role
        roleCache.set(userId, { role: data?.role || null, timestamp: Date.now() });
        
        // Additional logging for debugging
        if (data?.role === 'admin') {
          logger.log('AuthProvider: Confirmed user has admin role');
        } else {
          logger.log('AuthProvider: User does not have admin role, actual role:', data?.role);
        }
        
        // Refresh the session to ensure the role is properly set in the JWT
        logger.log('AuthProvider: Refreshing session to update JWT with role claim');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          logger.error('AuthProvider: Session refresh error:', refreshError.message);
        } else if (refreshedSession) {
          logger.log('AuthProvider: Session refreshed successfully with role claim');
          setSession(refreshedSession);
        }
      }
    } catch (error: any) {
      logger.error('AuthProvider: Exception during role fetching:', error.message);
      logger.error('AuthProvider: Exception stack:', error.stack);
      
      // Handle network exceptions
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
        logger.log('AuthProvider: Network exception detected, implementing retry logic');
        const retryCount = roleCache.get(`retry_${userId}`)?.role ? parseInt(roleCache.get(`retry_${userId}`)?.role || '0') : 0;
        const maxRetries = 3;
        
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1500; // Exponential backoff: 1.5s, 3s, 6s
          logger.log(`AuthProvider: Exception retry attempt ${retryCount + 1}/${maxRetries} in ${delay}ms`);
          
          // Store retry count
          roleCache.set(`retry_${userId}`, { role: (retryCount + 1).toString(), timestamp: Date.now() });
          
          setTimeout(async () => {
            setIsFetchingRole(false);
            await fetchUserRole(userId);
          }, delay);
          return;
        } else {
          logger.error('AuthProvider: Max retries exceeded for role fetching due to exceptions');
          // Clear retry count
          roleCache.delete(`retry_${userId}`);
        }
      }
      
      // Fallback: check if we can determine role from JWT in case of network errors
      if (session?.user?.role === 'admin') {
        logger.log('AuthProvider: Using role from JWT token as fallback');
        setRole('admin');
        // Cache the role
        roleCache.set(userId, { role: 'admin', timestamp: Date.now() });
      } else {
        // For other exceptions, retry once after 3 seconds
        logger.log('AuthProvider: Retrying role fetch in 3 seconds due to exception');
        setTimeout(async () => {
          setIsFetchingRole(false);
          await fetchUserRole(userId);
        }, 3000);
        return;
      }
    } finally {
      logger.log('AuthProvider: Role fetch completed');
      setIsFetchingRole(false);
    }
  }, [isFetchingRole, supabase, session]);

  useEffect(() => {
    logger.log('AuthProvider: Initializing authentication');
    
    // Check active sessions
    const initAuth = async () => {
      try {
        logger.log('AuthProvider: Checking for existing session');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('AuthProvider: Error getting session:', error.message);
          // Handle AuthSessionMissingError specifically
          if (error.message === 'Auth session missing!') {
            logger.warn('AuthProvider: Auth session missing during initialization, treating as no session');
            // Reset state cleanly
            setUser(null);
            setSession(null);
            setRole(null);
          }
        }
        
        logger.log('AuthProvider: Current session check result:', currentSession ? 'Session found' : 'No session');
        
        if (currentSession?.user) {
          logger.log('AuthProvider: Setting user from session:', currentSession.user.id);
          setUser(currentSession.user);
          setSession(currentSession);
          // Fetch role immediately
          await fetchUserRole(currentSession.user.id);
        } else {
          logger.log('AuthProvider: No active session found');
        }
      } catch (error: any) {
        logger.error('AuthProvider: Error initializing auth:', error.message);
        // Even if there's an error, we still want to finish loading
        // This prevents infinite loading states
      } finally {
        // Set loading to false after a small delay to ensure role is fetched
        setTimeout(() => {
          logger.log('AuthProvider: Finished initial loading');
          setIsLoading(false);
        }, 1000); // Reduced delay to 1 second
      }
    }

    initAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logger.log('AuthProvider: Auth state changed event:', event);
        logger.log('AuthProvider: Session in event:', currentSession ? 'Present' : 'None');
        
        // Only handle specific events to avoid duplicates
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (currentSession?.user) {
            logger.log('AuthProvider: Processing sign in/refresh for user:', currentSession.user.id);
            if (currentSession.user.id !== user?.id) {
              logger.log('AuthProvider: User changed, updating state');
              setUser(currentSession.user);
              setSession(currentSession);
              await fetchUserRole(currentSession.user.id);
            } else {
              logger.log('AuthProvider: Same user, skipping role fetch');
            }
          }
        } else if (event === 'SIGNED_OUT') {
          logger.log('AuthProvider: Processing sign out');
          setUser(null);
          setSession(null);
          setRole(null);
          // Clear cache on sign out
          roleCache.clear();
        } else {
          logger.log('AuthProvider: Ignoring event:', event);
        }
        
        // Ensure loading state is properly reset
        if (!isLoading) {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 100);
        } else {
          setIsLoading(false);
        }
      }
    );

    return () => {
      logger.log('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [user?.id]); // Dependency on user ID to detect changes

  const signIn = async (email: string, password: string) => {
    logger.log('AuthProvider: Attempting sign in for:', email);
    setIsLoading(true);
    
    try {
      // Validate inputs
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Note: We don't validate password length for login as users may have existing passwords
      if (!password) {
        throw new Error('Password is required');
      }

      logger.log('AuthProvider: Calling supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('AuthProvider: Supabase sign in error:', error.message);
        // Provide user-friendly error messages
        switch (error.message) {
          case 'Invalid login credentials':
            throw new Error('Invalid email or password');
          case 'Email not confirmed':
            throw new Error('Please confirm your email address before signing in');
          default:
            throw new Error('Authentication failed. Please try again.');
        }
      }

      if (data.user) {
        logger.log('AuthProvider: Sign in successful, setting user and session');
        setUser(data.user);
        setSession(data.session);
        logger.log('AuthProvider: Fetching user role');
        // Add timeout to role fetching to prevent hanging
        const roleFetchTimeout = new Promise((resolve) => {
          const timeout = setTimeout(() => {
            logger.warn('AuthProvider: Role fetch timeout reached');
            resolve(null);
          }, 5000); // 5 second timeout
          
          fetchUserRole(data.user.id).then(() => {
            clearTimeout(timeout);
            resolve(null);
          });
        });
        
        // Wait for role fetch or timeout
        await roleFetchTimeout;
        logger.log('AuthProvider: Role fetch completed or timed out');
      } else {
        logger.error('AuthProvider: No user data in sign in response');
        throw new Error('Authentication failed. No user data received.');
      }
    } catch (error: any) {
      logger.error('AuthProvider: Sign in error:', error.message);
      // Re-throw the error so it can be handled by the calling component
      throw error;
    } finally {
      logger.log('AuthProvider: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      logger.log('AuthProvider: Signing out user:', user?.id);
      setIsLoading(true);
      
      // Check if there's an active session before attempting to sign out
      if (!session) {
        logger.warn('AuthProvider: No active session to sign out');
        // Reset state even if there's no session
        setUser(null);
        setSession(null);
        setRole(null);
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        // Handle AuthSessionMissingError specifically
        if (error.message === 'Auth session missing!') {
          logger.warn('AuthProvider: Auth session missing during sign out, resetting state');
          // This is not a critical error - just reset state
          setUser(null);
          setSession(null);
          setRole(null);
          return;
        }
        logger.error('AuthProvider: Error during sign out:', error.message);
        throw error;
      }
      setUser(null);
      setSession(null);
      setRole(null);
      logger.log('AuthProvider: Sign out completed successfully');
    } catch (error: any) {
      logger.error('AuthProvider: Error signing out:', error.message);
      // Still reset state on error to prevent UI issues
      setUser(null);
      setSession(null);
      setRole(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      logger.log('AuthProvider: Refreshing session for user:', user?.id);
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        // Handle AuthSessionMissingError specifically
        if (error.message === 'Auth session missing!') {
          logger.warn('AuthProvider: Auth session missing during refresh, clearing state');
          // Reset state cleanly
          setUser(null);
          setSession(null);
          setRole(null);
          return null;
        }
        logger.error('AuthProvider: Error during session refresh:', error.message);
        throw error;
      }
      
      if (refreshedSession) {
        logger.log('AuthProvider: Session refreshed successfully');
        setUser(refreshedSession.user);
        setSession(refreshedSession);
        await fetchUserRole(refreshedSession.user.id);
        return refreshedSession;
      } else {
        logger.log('AuthProvider: No session returned from refresh');
        return null;
      }
    } catch (error: any) {
      logger.error('AuthProvider: Error refreshing session:', error.message);
      throw error;
    }
  };
  
  const isSessionValid = async (): Promise<boolean> => {
    try {
      logger.log('AuthProvider: Checking session validity');
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        logger.error('AuthProvider: Error checking session validity', error.message);
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
      logger.error('AuthProvider: Error validating session', error.message);
      return false;
    }
  };
  
  // Add session timeout and refresh mechanisms
  useEffect(() => {
    let refreshTimer: NodeJS.Timeout;
    
    const setupSessionRefresh = () => {
      if (session?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = session.expires_at - now;
        
        // Refresh 5 minutes before expiry
        const refreshTime = Math.max(timeUntilExpiry - 300, 60);
        
        logger.log('AuthProvider: Setting up session refresh in', refreshTime, 'seconds');
        
        refreshTimer = setTimeout(async () => {
          try {
            logger.log('AuthProvider: Auto-refreshing session');
            await refreshSession();
            logger.log('AuthProvider: Session auto-refresh completed');
          } catch (error: any) {
            logger.error('AuthProvider: Error during auto-refresh', error.message);
          }
        }, refreshTime * 1000);
      }
    };
    
    if (session) {
      setupSessionRefresh();
    }
    
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [session, refreshSession]);
  
  // Add session expiry check
  useEffect(() => {
    let expiryTimer: NodeJS.Timeout;
    
    const checkSessionExpiry = () => {
      if (session?.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = session.expires_at - now;
        
        if (timeUntilExpiry <= 0) {
          // Session has expired
          logger.log('AuthProvider: Session has expired, signing out');
          signOut();
        } else {
          // Check again when session expires
          expiryTimer = setTimeout(() => {
            logger.log('AuthProvider: Session expired, signing out');
            signOut();
          }, timeUntilExpiry * 1000);
        }
      }
    };
    
    if (session) {
      checkSessionExpiry();
    }
    
    return () => {
      if (expiryTimer) {
        clearTimeout(expiryTimer);
      }
    };
  }, [session, signOut]);

  logger.log('AuthProvider: Rendering with state:', { 
    user: user ? `User(${user.id})` : 'null', 
    hasRole: !!role,
    isLoading,
    isFetchingRole
  });

  // Log when role is set
  useEffect(() => {
    if (role) {
      logger.log('AuthProvider: Role updated to:', '[REDACTED]');
    }
  }, [role]);

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
        isSessionValid
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
  // Removed excessive logging to prevent performance issues
  // logger.log('AuthProvider: useAuth hook called');
  return context;
};