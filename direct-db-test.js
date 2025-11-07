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

// Create a service role client (has full access)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function directDbTest() {
  try {
    console.log('Direct database test...')
    
    // List all profiles to see what's in the database
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (allProfilesError) {
      console.error('All profiles error:', allProfilesError.message)
      return
    }
    
    console.log('All profiles in database:')
    allProfiles.forEach(profile => {
      console.log(`- ID: ${profile.id}, Email: ${profile.email}, Role: ${profile.role}`)
    })
    
    // Specifically check for admin@g.com
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@g.com')
      .maybeSingle()
    
    if (adminProfileError) {
      console.error('Admin profile error:', adminProfileError.message)
      return
    }
    
    if (adminProfile) {
      console.log('Admin profile found:')
      console.log(`- ID: ${adminProfile.id}`)
      console.log(`- Email: ${adminProfile.email}`)
      console.log(`- Role: ${adminProfile.role}`)
      console.log(`- Created at: ${adminProfile.created_at}`)
    } else {
      console.log('No admin profile found with email admin@g.com')
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

directDbTest()