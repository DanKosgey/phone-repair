import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using the local development URLs
// Updated to use the correct API port from supabase/config.toml
const supabaseUrl = 'http://127.0.0.1:54322';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const serviceRoleKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@g.com',
      password: 'Dan@2020',
    });
    
    if (signUpError) {
      console.error('Sign up error:', signUpError);
      // If user already exists, let's try to sign in instead
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@g.com',
        password: 'Dan@2020',
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        return;
      }
      
      console.log('User signed in:', signInData);
      authData.user = signInData.user;
    } else {
      console.log('User signed up:', authData);
    }
    
    // If we have a user, update the profile to set role to admin
    if (authData.user) {
      // Wait a moment for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the profile to set role to admin
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id);
      
      if (profileError) {
        console.error('Profile update error:', profileError);
        // If update fails, try to insert
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({ 
            id: authData.user.id,
            email: 'admin@g.com',
            role: 'admin'
          });
        
        if (insertError) {
          console.error('Profile insert error:', insertError);
          return;
        }
        
        console.log('Profile created with admin role:', insertData);
      } else {
        console.log('Profile updated to admin role:', profileData);
      }
    }
    
    console.log('Admin user created/updated successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();