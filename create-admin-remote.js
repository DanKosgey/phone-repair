import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using the remote database URLs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTIyMjksImV4cCI6MjA3NjM2ODIyOX0.IyIP9KX8xqseIgdKg4QOGTDC-znphm927rQQjnf5g6I';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MjIyOSwiZXhwIjoyMDc2MzY4MjI5fQ.CmX4F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fX';

console.log('Supabase URL:', supabaseUrl);

// Create Supabase clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@example.com',
      password: 'AdminPass123!',
    });
    
    if (signUpError) {
      console.error('Sign up error:', signUpError);
      // If user already exists, let's try to sign in instead
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'AdminPass123!',
      });
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        return;
      }
      
      console.log('User signed in:', signInData.user.id);
      authData.user = signInData.user;
    } else {
      console.log('User signed up:', authData.user.id);
    }
    
    // If we have a user, update the profile to set role to admin
    if (authData.user) {
      console.log('Setting admin role for user:', authData.user.id);
      
      // Wait a moment for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // First, try to update existing profile
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error('Profile update error:', updateError);
        // If update fails, try to insert
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({ 
            id: authData.user.id,
            email: 'admin@example.com',
            role: 'admin'
          });
        
        if (insertError) {
          console.error('Profile insert error:', insertError);
          return;
        }
        
        console.log('Profile created with admin role:', insertData);
      } else {
        console.log('Profile updated to admin role:', updateData);
      }
    }
    
    console.log('Admin user created/updated successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();