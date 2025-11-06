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

    // Prevent re-fetching for the same user
    if (lastFetchedUserIdRef.current === userId && isFetchingRole) {
      logger.log('AuthProvider: Role fetch already in progress for this user');
      return;
    }

    // Check cache first
    const cached = roleCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logger.log('AuthProvider: Using cached role');
      if (isMountedRef.current) {
        setRole(cached.role);
        lastFetchedUserIdRef.current = userId;
      }
      return;
    }

    // Cancel any pending role fetch
    if (roleAbortControllerRef.current) {
      roleAbortControllerRef.current.abort();
    }

    roleAbortControllerRef.current = new AbortController();
    const currentAbortController = roleAbortControllerRef.current;

    if (isMountedRef.current) {
      setIsFetchingRole(true);
    }
    lastFetchedUserIdRef.current = userId;
    logger.log('AuthProvider: Fetching role for user');
    
    try {
      // Add a timeout to prevent infinite waiting
      const timeoutPromise = new Promise((_, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Role fetch timeout'));
          if (isMountedRef.current) {
            setIsFetchingRole(false);
          }
        }, 10000); // 10 second timeout
        
        // Clean up timeout on abort
        currentAbortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
        });
      });

      const fetchPromise = (async () => {
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .abortSignal(currentAbortController.signal)
          .single();

        // Check if this request was aborted
        if (currentAbortController.signal.aborted || !isMountedRef.current) {
          logger.log('AuthProvider: Role fetch was aborted or component unmounted');
          throw new Error('Aborted');
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
              
              await new Promise(resolve => setTimeout(resolve, delay));
              if (isMountedRef.current) {
                setIsFetchingRole(false);
                lastFetchedUserIdRef.current = null;
                return fetchUserRole(userId);
              }
              return;
            } else {
              logger.error('AuthProvider: Max retries exceeded');
              retryAttemptsRef.current.delete(userId);
            }
          }
          
          if (isMountedRef.current) {
            setRole(null);
          }
        } else {
          // Success - clear retry count
          retryAttemptsRef.current.delete(userId);
          
          const userRole = data?.role || null;
          logger.log('AuthProvider: User role fetched successfully:', userRole);
          if (isMountedRef.current) {
            setRole(userRole);
            roleCache.set(userId, { role: userRole, timestamp: Date.now() });
          }
        }
      })();

      // Race the fetch against the timeout
      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error: any) {
      if (error.message === 'Aborted' || !isMountedRef.current) {
        logger.log('AuthProvider: Role fetch aborted');
        return;
      }
      
      if (error.message === 'Role fetch timeout') {
        logger.error('AuthProvider: Role fetch timed out');
      } else {
        logger.error('AuthProvider: Exception during role fetching:', error.message);
      }
      
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
  }, [isFetchingRole, supabase]);

  // Initialize authentication - ONLY RUNS ONCE
  useEffect(() => {
    // Prevent multiple initializations
    if (isInitializedRef.current || !supabase) {
      // Make sure to set loading to false if we're not initializing
      if (isMountedRef.current && isLoading) {
        setIsLoading(false);
      }
      return;
    }
    
    isInitializedRef.current = true;
    logger.log('AuthProvider: Initializing authentication');
    
    // Add a timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        logger.warn('AuthProvider: Initialization timeout, setting loading to false');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout
    
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
        
        // Add a small delay to ensure cookies are properly set
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
          await new Promise(resolve => setTimeout(resolve, 100));
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
          
          // Fetch role with timeout during initialization
          try {
            const timeoutPromise = new Promise<void>((resolve, reject) => {
              setTimeout(() => {
                reject(new Error('Role fetch timeout during initialization'));
              }, 5000);
            });
            
            await Promise.race([
              fetchUserRole(currentSession.user.id),
              timeoutPromise
            ]);
          } catch (roleError: any) {
            logger.error('AuthProvider: Error fetching role during initialization:', roleError.message);
            // Set role to null but continue with initialization
            if (isMountedRef.current) {
              setRole(null);
            }
          }
        } else {
          logger.log('AuthProvider: No active session found');
        }
      } catch (error: any) {
        logger.error('AuthProvider: Error initializing auth:', error.message);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        clearTimeout(initTimeout);
      }
    };

    // Only run initialization if we have a Supabase client
    if (supabase) {
      initAuth();
    } else {
      // If no Supabase client, set loading to false
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      clearTimeout(initTimeout);
    }

    // Listen to auth changes (only if we have a Supabase client)
    if (supabase) {
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
                
                // Fetch role with timeout during sign in
                try {
                  const timeoutPromise = new Promise<void>((resolve, reject) => {
                    setTimeout(() => {
                      reject(new Error('Role fetch timeout during sign in event'));
                    }, 5000);
                  });
                  
                  await Promise.race([
                    fetchUserRole(currentSession.user.id),
                    timeoutPromise
                  ]);
                } catch (roleError: any) {
                  logger.error('AuthProvider: Error fetching role during sign in event:', roleError.message);
                  // Set role to null but continue with sign in
                  if (isMountedRef.current) {
                    setRole(null);
                  }
                }
              }
              if (isMountedRef.current) {
                setIsLoading(false);
              }
              break;
              
            case 'TOKEN_REFRESHED':
              if (currentSession?.user) {
                setUser(currentSession.user);
                setSession(currentSession);
                // Don't re-fetch role on token refresh if we already have it
                if (!role) {
                  lastFetchedUserIdRef.current = null;
                  
                  // Fetch role with timeout during token refresh
                  try {
                    const timeoutPromise = new Promise<void>((resolve, reject) => {
                      setTimeout(() => {
                        reject(new Error('Role fetch timeout during token refresh'));
                      }, 5000);
                    });
                    
                    await Promise.race([
                      fetchUserRole(currentSession.user.id),
                      timeoutPromise
                    ]);
                  } catch (roleError: any) {
                    logger.error('AuthProvider: Error fetching role during token refresh:', roleError.message);
                    // Set role to null but continue with token refresh
                    if (isMountedRef.current) {
                      setRole(null);
                    }
                  }
                }
              }
              if (isMountedRef.current) {
                setIsLoading(false);
              }
              break;
              
            case 'SIGNED_OUT':
              setUser(null);
              setSession(null);
              setRole(null);
              roleCache.clear();
              retryAttemptsRef.current.clear();
              lastFetchedUserIdRef.current = null;
              if (isMountedRef.current) {
                setIsLoading(false);
              }
              break;
              
            case 'USER_UPDATED':
              if (currentSession?.user) {
                setUser(currentSession.user);
                setSession(currentSession);
              }
              if (isMountedRef.current) {
                setIsLoading(false);
              }
              break;

            case 'INITIAL_SESSION':
              // Ignore INITIAL_SESSION as it's handled by initAuth
              break;
              
            default:
              if (isMountedRef.current) {
                setIsLoading(false);
              }
              break;
          }
        }
      );

      return () => {
        subscription.unsubscribe();
        clearTimeout(initTimeout);
      };
    } else {
      // If no Supabase client, set loading to false
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      clearTimeout(initTimeout);
    }
  }, [supabase]); // Depend on supabase client

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
            lastFetchedUserIdRef.current = null;
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
        
        // Reset fetch tracker
        lastFetchedUserIdRef.current = null;
        
        // Fetch role with timeout
        try {
          const timeoutPromise = new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Role fetch timeout during sign in'));
            }, 5000);
            
            // Clean up on successful role fetch
            const cleanup = () => clearTimeout(timeout);
            
            // Listen for abort signal
            if (roleAbortControllerRef.current) {
              roleAbortControllerRef.current.signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('Role fetch aborted'));
              });
            }
          });
          
          await Promise.race([
            fetchUserRole(data.user.id),
            timeoutPromise
          ]);
        } catch (roleError: any) {
          logger.error('AuthProvider: Error fetching role during sign in:', roleError.message);
          // Set role to null but don't fail the sign in
          if (isMountedRef.current) {
            setRole(null);
          }
        }
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
          
          // Also clear any cookies that might have been set with different domains
          if (process.env.NODE_ENV === 'production') {
            const domain = window.location.hostname;
            const baseDomain = domain.replace(/^www\./, '');
            const cookieNames = ['sb-access-token', 'sb-refresh-token'];
            
            cookieNames.forEach(cookieName => {
              try {
                document.cookie = `${cookieName}=; path=/; max-age=0`;
                document.cookie = `${cookieName}=; path=/; domain=${domain}; max-age=0`;
                document.cookie = `${cookieName}=; path=/; domain=.${domain}; max-age=0`;
                document.cookie = `${cookieName}=; path=/; domain=${baseDomain}; max-age=0`;
                document.cookie = `${cookieName}=; path=/; domain=.${baseDomain}; max-age=0`;
              } catch (removeError) {
                logger.error(`Failed to remove cookie ${cookieName}:`, removeError);
              }
            });
          }
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
          try {
            // Add timeout for role fetching during refresh
            const timeoutPromise = new Promise<void>((resolve, reject) => {
              setTimeout(() => {
                reject(new Error('Role fetch timeout during session refresh'));
              }, 5000);
            });
            
            await Promise.race([
              fetchUserRole(refreshedSession.user.id),
              timeoutPromise
            ]);
          } catch (roleError: any) {
            logger.error('AuthProvider: Error fetching role during session refresh:', roleError.message);
            // Set role to null but continue with session refresh
            if (isMountedRef.current) {
              setRole(null);
            }
          }
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
        lastFetchedUserIdRef.current = null;
        
        try {
          // Add timeout for role fetching during recovery
          const timeoutPromise = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Role fetch timeout during session recovery'));
            }, 5000);
          });
          
          await Promise.race([
            fetchUserRole(currentSession.user.id),
            timeoutPromise
          ]);
        } catch (roleError: any) {
          logger.error('AuthProvider: Error fetching role during session recovery:', roleError.message);
          // Set role to null but continue with session recovery
          if (isMountedRef.current) {
            setRole(null);
          }
        }
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