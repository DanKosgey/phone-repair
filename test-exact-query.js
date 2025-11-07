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

async function testExactQuery() {
  try {
    console.log('Testing exact query that application makes...')
    
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
    
    // Now test the EXACT query that the application is making
    // This is the exact code from the fetchUserRole function
    const userId = signInData.user.id;
    
    console.log('Making exact query with abort signal...');
    
    // Create an abort controller like in the application
    const abortController = new AbortController();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .abortSignal(abortController.signal)
      .maybeSingle();
      
    console.log('Exact query result:', { data, error })
    
    if (error) {
      console.error('Query error:', error.message)
    } else {
      console.log('Role from exact query:', data?.role || 'null')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

testExactQuery()