// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/database.types'

// Custom cookie-based storage for Supabase auth
const cookieStorage = {
  getItem: (key: string): string | null => {
    if (typeof document === 'undefined') return null
    const name = `${key}=`
    const decodedCookie = decodeURIComponent(document.cookie)
    const ca = decodedCookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return null
  },
  setItem: (key: string, value: string): void => {
    if (typeof document === 'undefined') return
    // Set cookie with 7 days expiry
    const expires = new Date()
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)
    document.cookie = `${key}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  },
  removeItem: (key: string): void => {
    if (typeof document === 'undefined') return
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  },
}

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null

export const getSupabaseBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: cookieStorage, // Use cookie storage instead of localStorage
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // Use PKCE flow for better security
      },
    })
  }
  
  return supabaseClient
}

// Export a default instance for convenience
export const supabase = getSupabaseBrowserClient()