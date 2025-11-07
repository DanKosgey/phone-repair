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

async function createProfile() {
  try {
    console.log('Creating profile for new user...')
    
    // Create a profile for the new user
    const { data, error } = await supabase
      .from('profiles')
      .insert({ 
        id: 'a521e863-ecd1-4347-90c6-3fb81c3ad5a7',
        email: 'admin@g.com',
        role: 'admin'
      });
    
    if (error) {
      console.error('Error creating profile:', error.message)
      return
    }
    
    console.log('Profile created:', data)
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

createProfile()