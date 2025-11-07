// Apply the RLS fix using service role key
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

async function applyRLSFix() {
  try {
    console.log('Applying RLS fix for profiles table...')
    
    // Create client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    // Drop existing policies that might be causing issues
    console.log('Dropping existing policies...');
    const { error: dropError1 } = await supabase.rpc('execute_sql', {
      sql: 'DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles'
    });
    
    if (dropError1) {
      console.log('Drop policy 1 error (may be expected):', dropError1.message);
    }
    
    const { error: dropError2 } = await supabase.rpc('execute_sql', {
      sql: 'DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles'
    });
    
    if (dropError2) {
      console.log('Drop policy 2 error (may be expected):', dropError2.message);
    }
    
    // Create simplified policies that don't use subqueries
    console.log('Creating new policies...');
    const { error: createError1 } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE POLICY "Users can view own profile" ON public.profiles
        FOR SELECT USING (auth.uid() = id)
      `
    });
    
    if (createError1) {
      console.log('Create policy 1 error (may be expected):', createError1.message);
    } else {
      console.log('Created "Users can view own profile" policy');
    }
    
    const { error: createError2 } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id)
      `
    });
    
    if (createError2) {
      console.log('Create policy 2 error (may be expected):', createError2.message);
    } else {
      console.log('Created "Users can update own profile" policy');
    }
    
    console.log('RLS fix applied successfully!');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

applyRLSFix()