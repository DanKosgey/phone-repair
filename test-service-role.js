// Test using service role key to bypass RLS policies
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv';
config({ path: '.env.local' });

// Use the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

async function testServiceRole() {
  try {
    console.log('Testing with service role key (bypasses RLS)...')
    
    // Create client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Test the exact same query but with service role key
    const userId = '661ce13c-0f3f-451b-8668-6e9670824f7e';
    console.log('Fetching role for user:', userId);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    console.log('Service role query result:', { data, error });
    
    if (error) {
      console.error('Service role query error:', error.message);
    } else {
      console.log('Role with service role key:', data?.role || 'null');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testServiceRole()