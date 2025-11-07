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

async function checkAllProfiles() {
  try {
    console.log('Checking all profiles...')
    
    // Get all profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
    
    if (error) {
      console.error('Error fetching profiles:', error.message)
      return
    }
    
    console.log('All profiles:')
    data.forEach(profile => {
      console.log(`- ID: ${profile.id}, Email: ${profile.email}, Role: ${profile.role}`)
    })
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

checkAllProfiles()