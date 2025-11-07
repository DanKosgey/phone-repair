// Test using the same approach as the browser client
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
config({ path: '.env.local' });

// Use the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Mimic the browser client creation from client.ts
function getSupabaseBrowserClient() {
  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (e) {
    console.warn(`Invalid Supabase URL format: ${supabaseUrl}. Returning null client.`)
    return null
  }

  const browserClient = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        // Match the settings from client.ts
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: true,
      }
    }
  )

  return browserClient
}

async function testBrowserClient() {
  try {
    console.log('Testing with browser client approach...')
    
    const supabase = getSupabaseBrowserClient()
    
    if (!supabase) {
      console.error('Failed to create Supabase client')
      return
    }
    
    // First, sign in to get a session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@g.com',
      password: 'dan'
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError.message)
      return
    }
    
    console.log('Signed in successfully with user ID:', signInData.user.id)
    
    // Wait a moment for session to be established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Now test the exact query that the application is making
    const userId = signInData.user.id;
    
    console.log('Fetching role for user', userId);
    
    // Create an abort controller like in the application
    const abortController = new AbortController();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .abortSignal(abortController.signal)
      .maybeSingle();
      
    console.log('Query result:', { data, error })
    
    if (error) {
      console.error('Query error:', error.message)
    } else {
      console.log('Role:', data?.role || 'null')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

testBrowserClient()