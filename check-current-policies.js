// Check current RLS policies using service role key
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

async function checkCurrentPolicies() {
  try {
    console.log('Checking current RLS policies...')
    
    // Create client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Check if RLS is enabled on profiles table
    const { data: rlsData, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, relrowsecurity')
      .eq('tablename', 'profiles')
      .single();
    
    if (rlsError) {
      console.log('RLS check error (may be expected):', rlsError.message);
    } else {
      console.log('RLS enabled on profiles table:', rlsData.relrowsecurity);
    }
    
    // Try to check current policies
    const { data: policyData, error: policyError } = await supabase
      .rpc('supabase_policies', { table_name: 'profiles' });
    
    if (policyError) {
      console.log('Policy check error (may be expected):', policyError.message);
    } else {
      console.log('Current policies on profiles table:');
      policyData.forEach(policy => {
        console.log(`- ${policy.policy_name}: ${policy.policy_definition}`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkCurrentPolicies()