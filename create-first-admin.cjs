// Create the first admin user
const { createClient } = require('@supabase/supabase-js');

// Use the exact same environment variables as in your application
const supabaseUrl = 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTIyMjksImV4cCI6MjA3NjM2ODIyOX0.IyIP9KX8xqseIgdKg4QOGTDC-znphm927rQQjnf5g6I';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MjIyOSwiZXhwIjoyMDc2MzY4MjI5fQ.CmX4F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fX';

console.log('Creating first admin user...');

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function createFirstAdmin() {
  try {
    console.log('Step 1: Creating user account');
    
    // Let's try a different approach - create a user directly in the auth system
    // and then create a profile for them
    
    // First, let's try to sign up with a simple email
    const email = 'admin@example.com'; // This should work
    const password = 'AdminPassword123!';
    
    console.log('Creating user with email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) {
      console.error('Sign up error:', error.message);
      return;
    }
    
    console.log('User created successfully!');
    console.log('User ID:', data.user.id);
    
    // Wait a bit for the profile to be created
    console.log('Waiting for profile creation...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Now let's directly insert a profile with admin role
    console.log('Creating admin profile...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ 
        id: data.user.id,
        email: email,
        role: 'admin'
      }, {
        onConflict: 'id'
      });
    
    if (profileError) {
      console.error('Profile creation error:', profileError.message);
      return;
    }
    
    console.log('Admin profile created successfully!');
    console.log('\n=== ADMIN USER CREATED ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('==========================');
    console.log('You can now log in with these credentials.');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.error('Error details:', error);
  }
}

createFirstAdmin();