import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkUserProfile() {
  try {
    console.log('Checking user profile...')
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError.message)
      return
    }
    
    if (!session) {
      console.log('No active session')
      return
    }
    
    console.log('Current user:', session.user.id, session.user.email)
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
    
    if (profileError) {
      console.error('Profile error:', profileError.message)
      return
    }
    
    if (profile) {
      console.log('Profile found:', profile)
    } else {
      console.log('No profile found for user')
      
      // Try to create a profile
      console.log('Attempting to create profile...')
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email,
          role: 'admin'
        })
        .select()
        .maybeSingle()
      
      if (createError) {
        console.error('Failed to create profile:', createError.message)
      } else {
        console.log('Profile created:', newProfile)
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error.message)
  }
}

checkUserProfile()