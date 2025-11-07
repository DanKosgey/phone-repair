import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase admin environment variables')
    return null as any
  }

  try {
    new URL(supabaseUrl)
  } catch (e) {
    console.error('Invalid Supabase URL')
    return null as any
  }

  // FIX: Admin client should bypass RLS
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    }
  })
}