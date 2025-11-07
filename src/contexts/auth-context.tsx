"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { getSupabaseBrowserClient } from '@/server/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<Session | null>;
  isSessionValid: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabaseRef = useRef<ReturnType<typeof getSupabaseBrowserClient> | null>(null);
  
  // Initialize Supabase client safely - only once
  if (!supabaseRef.current && typeof window !== 'undefined') {
    supabaseRef.current = getSupabaseBrowserClient();
  }

  const supabase = supabaseRef.current;

  // FIX: Simplified session refresh logic
  const scheduleRefresh = useCallback((expiresAt: number) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh 5 minutes before expiry
    const refreshIn = Math.max((timeUntilExpiry - 300) * 1000, 60000);
    
    refreshTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current || !supabase) return;
      
      try {
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.error('Auto-refresh error:', error.message);
          if (error.message.includes('session') || error.message.includes('expired')) {
            setUser(null);
            setSession(null);
          }
        } else if (data.session && isMountedRef.current) {
          setUser(data.session.user);
          setSession(data.session);
        }
      } catch (error) {
        console.error('Auto-refresh exception:', error);
      }
    }, refreshIn);
  }, [supabase]);

  // FIX: Initialize authentication - ONLY RUNS ONCE
  useEffect(() => {
    console.log('AuthProvider: Initializing authentication', {
      isInitialized: isInitializedRef.current,
      hasSupabase: !!supabase
    });
    
    if (isInitializedRef.current || !supabase) {
      console.log('AuthProvider: Already initialized or no supabase, setting loading to false');
      setIsLoading(false);
      return;
    }
    
    isInitializedRef.current = true;
    console.log('AuthProvider: Marking as initialized');
    
    let mounted = true;
    
    // Set timeout for initialization
    const initTimeout = setTimeout(() => {
      if (mounted) {
        console.log('AuthProvider: Initialization timeout, setting loading to false');
        setIsLoading(false);
      }
    }, 5000);
    
    // Get initial session
    console.log('AuthProvider: Getting initial session');
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      console.log('AuthProvider: Initial session result', {
        hasSession: !!initialSession,
        sessionUserId: initialSession?.user?.id,
        error: error?.message
      });
      
      if (!mounted) {
        console.log('AuthProvider: Component unmounted, skipping session setup');
        return;
      }
      
      if (initialSession) {
        console.log('AuthProvider: Setting initial session', {
          userId: initialSession.user.id
        });
        setUser(initialSession.user);
        setSession(initialSession);
        if (initialSession.expires_at) {
          scheduleRefresh(initialSession.expires_at);
        }
      }
      setIsLoading(false);
    });

    // Listen to auth changes
    console.log('AuthProvider: Setting up auth state change listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('AuthProvider: Auth state changed', {
          event,
          hasSession: !!currentSession,
          sessionUserId: currentSession?.user?.id
        });
        
        if (!mounted) {
          console.log('AuthProvider: Component unmounted, skipping auth state change');
          return;
        }

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
            if (currentSession?.user) {
              console.log('AuthProvider: Setting user from auth state change', {
                event,
                userId: currentSession.user.id
              });
              setUser(currentSession.user);
              setSession(currentSession);
              if (currentSession.expires_at) {
                scheduleRefresh(currentSession.expires_at);
              }
            }
            setIsLoading(false);
            break;
            
          case 'SIGNED_OUT':
            console.log('AuthProvider: User signed out, clearing state');
            setUser(null);
            setSession(null);
            if (refreshTimeoutRef.current) {
              clearTimeout(refreshTimeoutRef.current);
            }
            setIsLoading(false);
            break;
        }
      }
    );

    return () => {
      console.log('AuthProvider: Cleaning up');
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [supabase, scheduleRefresh]);

  // Sign in
  const signIn = async (email: string, password: string): Promise<void> => {
    console.log('AuthProvider: Starting sign in', { email });
    
    if (!supabase) {
      console.error('AuthProvider: No Supabase client available');
      throw new Error('Supabase client not available');
    }
    
    setIsLoading(true);
    
    try {
      // FIX: Basic validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.log('AuthProvider: Invalid email format');
        throw new Error('Please enter a valid email address');
      }

      if (!password) {
        console.log('AuthProvider: No password provided');
        throw new Error('Password is required');
      }

      console.log('AuthProvider: Calling Supabase signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      console.log('AuthProvider: Supabase signInWithPassword result', {
        hasData: !!data,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        hasSession: !!data?.session,
        error: error?.message
      });

      if (error) {
        console.error('AuthProvider: Sign in error from Supabase', error.message);
        // FIX: Better error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before signing in');
        } else {
          throw new Error(error.message);
        }
      }

      if (!data.user || !data.session) {
        console.error('AuthProvider: Missing user or session in response');
        throw new Error('Authentication failed. Please try again.');
      }

      console.log('AuthProvider: Sign in successful, user and session will be set by listener');
      // Session will be set by onAuthStateChange listener
    } catch (error: any) {
      console.error('AuthProvider: Sign in error:', error);
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
      setUser(null);
      setSession(null);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Clear refresh timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      // Clear state immediately
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error && !error.message.includes('session')) {
        console.error('Sign out error:', error.message);
      }
      
      // FIX: Clear all Supabase data from storage
      if (typeof window !== 'undefined') {
        // Clear localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear sessionStorage
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      // Ensure state is cleared even on error
      setUser(null);
      setSession(null);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Refresh session
  const refreshSession = useCallback(async (): Promise<Session | null> => {
    if (!supabase) return null;
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        if (error.message.includes('session')) {
          setUser(null);
          setSession(null);
        }
        throw error;
      }
      
      if (data.session && isMountedRef.current) {
        setUser(data.session.user);
        setSession(data.session);
        return data.session;
      }
      
      return null;
    } catch (error) {
      console.error('Refresh session error:', error);
      throw error;
    }
  }, [supabase]);

  // Check session validity
  const isSessionValid = useCallback(async (): Promise<boolean> => {
    if (!supabase || !session) return false;
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) return false;
      
      // Check expiry
      if (data.session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        return data.session.expires_at > now;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }, [supabase, session]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signOut,
        refreshSession,
        isSessionValid,
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