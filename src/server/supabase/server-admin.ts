import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/database.types'

// Get Supabase admin client (for server-side operations with service role key)
export const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // Check if we're in a server environment during build time
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.warn('Supabase admin client initialized during build time - env vars may not be available yet')
    // Return a minimal client that will be replaced during runtime
    return null as any
  }

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (e) {
    throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`)
  }

  // Create Supabase client with service role key for admin operations
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}