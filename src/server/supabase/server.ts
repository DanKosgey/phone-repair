import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/database.types'

// Get Supabase server client
export const getSupabaseServerClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we're in a server environment during build time
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase server client initialized during build time - env vars may not be available yet')
    // Return a minimal client that will be replaced during runtime
    return null as any
  }

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (e) {
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}