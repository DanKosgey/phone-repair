import { createClient } from '@supabase/supabase-js'

// Configuration - replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProfileCreation() {
  console.log('Testing profile creation...')
  
  try {
    // Sign up a new test user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'test-profile@example.com',
      password: 'TestPass123!',
    })
    
    if (signUpError) {
      console.error('Sign up error:', signUpError.message)
      return
    }
    
    console.log('User signed up successfully:', authData.user.id)
    
    // Wait a moment for the profile to be created by the trigger
    console.log('Waiting for profile creation...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Check if profile was created
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', authData.user.id)
      .maybeSingle()
    
    if (profileError) {
      console.error('Profile fetch error:', profileError.message)
      return
    }
    
    if (profile) {
      console.log('✅ Profile created successfully:')
      console.log('  ID:', profile.id)
      console.log('  Email:', profile.email)
      console.log('  Role:', profile.role || 'null (default)')
    } else {
      console.log('❌ Profile was not created')
    }
    
    // Clean up - delete the test user
    if (authData.user?.id) {
      console.log('Cleaning up test user...')
      // Note: In a real scenario, you'd want to delete the profile and auth user
      // This is just for demonstration
    }
    
  } catch (error) {
    console.error('Test error:', error.message)
  }
}

testProfileCreation()