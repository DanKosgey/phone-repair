import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
config({ path: '.env.local' });

// Use the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testRoleQuery() {
  try {
    console.log('Testing role query with service role key...')
    
    // Test the exact query that the application is making
    const userId = '661ce13c-0f3f-451b-8668-6e9670824f7e'
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

testRoleQuery()