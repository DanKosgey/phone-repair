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

// Create an anon client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testJwtFunction() {
  try {
    console.log('Testing JWT function...')
    
    // Let's try to sign in and then test the function
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'admin@g.com',
      password: 'dan'
    })
    
    if (signInError) {
      console.error('Sign in error:', signInError.message)
      return
    }
    
    console.log('Signed in successfully')
    
    // Now test the function
    const { data: functionResult, error: functionError } = await supabase.rpc('set_role_claim_in_jwt')
    
    if (functionError) {
      console.error('Function call error:', functionError.message)
      return
    }
    
    console.log('Function result:', functionResult)
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

testJwtFunction()