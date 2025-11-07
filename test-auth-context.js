// This is a simplified test to check if the auth context fetchUserRole function works
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

async function testAuthContext() {
  try {
    console.log('Testing auth context role fetch...')
    
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
    
    // Simulate the exact fetchUserRole function from auth-context.tsx
    const userId = signInData.user.id;
    
    console.log('Fetching role for user', userId);
    
    // Cancel any pending role fetch (simulate abort controller)
    let currentAbortController = new AbortController();
    
    console.log('Making Supabase request for role');
    
    // Use maybeSingle() instead of single() to handle cases where profile doesn't exist yet
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .abortSignal(currentAbortController.signal)
      .maybeSingle();
    
    console.log('Role fetch response', { data, error });
    
    if (error) {
      console.error('Error fetching user role:', error.message);
    } else {
      // data might be null if profile doesn't exist, which is handled gracefully
      const userRole = data?.role || null;
      console.log('Setting user role', userRole);
    }
    
  } catch (error) {
    console.error('Exception during role fetching:', error.message);
  }
}

testAuthContext()