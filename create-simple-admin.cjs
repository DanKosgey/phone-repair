const { createClient } = require('@supabase/supabase-js');

// Use your remote database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTIyMjksImV4cCI6MjA3NjM2ODIyOX0.IyIP9KX8xqseIgdKg4QOGTDC-znphm927rQQjnf5g6I';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MjIyOSwiZXhwIjoyMDc2MzY4MjI5fQ.CmX4F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fX';

console.log('Connecting to Supabase at:', supabaseUrl);

// Create clients
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Use a proper email format
    const email = 'admin@yourdomain.com';
    const password = 'AdminPass123!';
    
    console.log('Signing up user:', email);
    
    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) {
      console.error('Sign up error:', error.message);
      return;
    }
    
    console.log('Sign up successful. User ID:', data.user.id);
    
    // Wait a moment for profile creation
    console.log('Waiting for profile to be created...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update the profile to set role to admin
    console.log('Setting admin role...');
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user.id);
    
    if (updateError) {
      console.error('Profile update error:', updateError.message);
      
      // Try to insert if update fails
      console.log('Trying to insert profile...');
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ 
          id: data.user.id,
          email: email,
          role: 'admin'
        });
      
      if (insertError) {
        console.error('Profile insert error:', insertError.message);
        return;
      }
      
      console.log('Profile created with admin role');
    } else {
      console.log('Profile updated with admin role');
    }
    
    console.log('Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

createAdminUser();