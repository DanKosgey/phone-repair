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

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRoleFix() {
  try {
    console.log('Testing role fetch after RLS policy fix...')
    
    // First, sign in to get a session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@g.com',
      password: 'dan'  // Corrected password
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError.message)
      return
    }
    
    console.log('Signed in successfully with user ID:', signInData.user.id)
    
    // Now test the exact query that the application is making
    const userId = signInData.user.id
    console.log('Fetching role for user ID:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
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

testRoleFix()