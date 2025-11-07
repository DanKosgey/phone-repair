import { createClient } from '@supabase/supabase-js'

// Configuration - replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAuthFlow() {
  console.log('=== Authentication Flow Debug ===')
  
  try {
    // 1. Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...')
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (healthError && healthError.message !== 'Relation not found (public.profiles)') {
      console.error('❌ Supabase connection error:', healthError.message)
      return
    }
    console.log('✅ Supabase connection successful')
    
    // 2. Test authentication with existing user
    console.log('\n2. Testing authentication...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message)
    } else if (sessionData.session) {
      console.log('✅ User is authenticated')
      console.log('  User ID:', sessionData.session.user.id)
      console.log('  Email:', sessionData.session.user.email)
      
      // 3. Test profile fetching
      console.log('\n3. Testing profile fetching...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', sessionData.session.user.id)
        .maybeSingle()
      
      if (profileError) {
        console.error('❌ Profile fetch error:', profileError.message)
        console.log('Error code:', profileError.code)
        console.log('Error details:', profileError.details)
        console.log('Error hint:', profileError.hint)
      } else if (profile) {
        console.log('✅ Profile fetched successfully:')
        console.log('  ID:', profile.id)
        console.log('  Email:', profile.email)
        console.log('  Role:', profile.role || 'null')
      } else {
        console.log('⚠️  No profile found for user')
      }
    } else {
      console.log('⚠️  No active session - user is not authenticated')
    }
    
    // 4. Test RLS policies
    console.log('\n4. Testing RLS policies...')
    // Try to fetch all profiles (should only return ones we have access to)
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, email')
    
    if (allProfilesError) {
      console.error('❌ All profiles fetch error:', allProfilesError.message)
    } else {
      console.log(`✅ Fetched ${allProfiles.length} profile(s) (based on RLS policies)`)
      allProfiles.slice(0, 3).forEach(profile => {
        console.log('  -', profile.email)
      })
      if (allProfiles.length > 3) {
        console.log(`  ... and ${allProfiles.length - 3} more`)
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
  
  console.log('\n=== Debug Complete ===')
}

debugAuthFlow()