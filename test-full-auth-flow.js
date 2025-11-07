// Test the full authentication flow like in the application
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

async function testFullAuthFlow() {
  try {
    console.log('Testing full authentication flow...')
    
    // Create client with same settings as application
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: true,
          detectSessionInUrl: true,
        }
      }
    );
    
    // Sign in
    console.log('Signing in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@g.com',
      password: 'dan'
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError.message)
      return
    }
    
    console.log('Signed in successfully');
    console.log('User ID:', signInData.user.id);
    
    // Wait for session to be established
    console.log('Waiting for session to establish...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check current session
    console.log('Checking current session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message)
      return
    }
    
    console.log('Current session user ID:', sessionData.session?.user?.id);
    
    // Now test the exact role fetch like in the application
    const userId = signInData.user.id;
    console.log('Fetching role for user:', userId);
    
    // Create abort controller like in the application
    const abortController = new AbortController();
    
    // Make the exact same query as in fetchUserRole
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .abortSignal(abortController.signal)
      .maybeSingle();
    
    console.log('Role fetch result:', { data, error });
    
    if (error) {
      console.error('Role fetch error:', error.message);
    } else {
      console.log('Role:', data?.role || 'null');
    }
    
    // Also test without abort signal to see if that makes a difference
    console.log('Testing without abort signal...');
    const { data: data2, error: error2 } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    console.log('Role fetch result without abort signal:', { data: data2, error: error2 });
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testFullAuthFlow()