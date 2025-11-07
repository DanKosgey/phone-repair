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

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setAdminRole() {
  try {
    console.log('Setting admin role for new user...')
    
    // Update the profile to set role to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', 'admin@g.com');
    
    if (error) {
      console.error('Error updating profile:', error.message)
      return
    }
    
    console.log('Profile updated to admin role:', data)
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

setAdminRole()