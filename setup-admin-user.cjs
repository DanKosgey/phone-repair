const { createClient } = require('@supabase/supabase-js');

// Use your remote database configuration from .env.local
const supabaseUrl = 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTIyMjksImV4cCI6MjA3NjM2ODIyOX0.IyIP9KX8xqseIgdKg4QOGTDC-znphm927rQQjnf5g6I';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MjIyOSwiZXhwIjoyMDc2MzY4MjI5fQ.CmX4F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fX';

console.log('Setting up admin user for Supabase at:', supabaseUrl);

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Use a valid email format
    const email = 'admin@jaysphonerepair.com';
    const password = 'SecureAdminPass123!';
    
    console.log('Step 1: Signing up user with email:', email);
    
    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (signUpError) {
      console.error('Sign up error:', signUpError.message);
      // If user already exists, we'll handle that case
      if (signUpError.message.includes('already registered')) {
        console.log('User already exists. You will need to sign in or reset the password.');
      }
      return;
    }
    
    console.log('Sign up successful!');
    console.log('User ID:', signUpData.user.id);
    
    // Wait for profile to be created (it should be automatic)
    console.log('Step 2: Waiting for profile creation...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Try to update the profile to set role to admin
    console.log('Step 3: Setting admin role...');
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', signUpData.user.id);
    
    if (updateError) {
      console.error('Profile update error:', updateError.message);
      
      // Try to insert if update fails
      console.log('Step 4: Trying to insert profile...');
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ 
          id: signUpData.user.id,
          email: email,
          role: 'admin'
        });
      
      if (insertError) {
        console.error('Profile insert error:', insertError.message);
        console.log('You may need to manually set the role in the Supabase dashboard');
        return;
      }
      
      console.log('Profile created with admin role');
    } else {
      console.log('Profile updated with admin role');
    }
    
    console.log('\n=== ADMIN USER SETUP COMPLETE ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('User ID:', signUpData.user.id);
    console.log('==================================');
    console.log('You can now log in with these credentials and access the admin panel.');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

setupAdminUser();