import { getSupabaseBrowserClient } from '@/server/supabase/client';
import { Session } from '@supabase/supabase-js';

/**
 * Get the current user session
 * @returns Promise<Session | null>
 */
export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Refresh the current user session
 * @returns Promise<Session | null>
 */
export async function refreshSession(): Promise<Session | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.refreshSession();
  return session;
}

/**
 * Check if the current session is valid
 * @returns Promise<boolean>
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session && session.expires_at! > Math.floor(Date.now() / 1000);
}

/**
 * Get the current user ID from session
 * @returns Promise<string | null>
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id || null;
}

/**
 * Check if the current user has admin role
 * @returns Promise<boolean>
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = getSupabaseBrowserClient();
  const userId = await getCurrentUserId();
  
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
    
    return data?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
}