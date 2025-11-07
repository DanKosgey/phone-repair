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

async function checkRLSPolicies() {
  try {
    console.log('Checking RLS policies for profiles table...')
    
    // Check RLS status and policies using raw SQL
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        -- Check RLS status
        SELECT 
            tablename, 
            relrowsecurity as rls_enabled
        FROM pg_tables 
        WHERE tablename = 'profiles' AND schemaname = 'public';
        
        -- Check policies
        SELECT 
            polname as policy_name,
            polcmd as command,
            polqual as policy_condition
        FROM pg_policy 
        WHERE polrelid = 'profiles'::regclass;
      `
    });
      
    if (error) {
      console.error('Error executing SQL:', error.message)
      return
    }
    
    console.log('Query result:', data)
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

// Let's try a simpler approach - directly query the profiles table
async function testDirectQuery() {
  try {
    console.log('Testing direct query...')
    
    // Try to query the profiles table directly
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', '661ce13c-0f3f-451b-8668-6e9670824f7e')
    
    console.log('Direct query result:', { data, error })
    
  } catch (error) {
    console.error('Unexpected error in direct query:', error.message)
  }
}

async function main() {
  await checkRLSPolicies()
  await testDirectQuery()
}

main()