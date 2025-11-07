import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Supabase configuration - using the remote development URLs from .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key exists:', !!supabaseKey);
console.log('Service Role Key exists:', !!serviceRoleKey);

// Check if we have the required configuration
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

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
      
      console.log('Attempting to update profile with admin role...');
      
      // Update the profile to set role to admin
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id);
      
      if (profileError) {
        console.error('Profile update error:', profileError);
        // If update fails, try to insert
        console.log('Attempting to insert profile with admin role...');
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