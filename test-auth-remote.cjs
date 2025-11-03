const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTIyMjksImV4cCI6MjA3NjM2ODIyOX0.IyIP9KX8xqseIgdKg4QOGTDC-znphm927rQQjnf5g6I';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? '[REDACTED]' : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testAuth() {
  try {
    console.log('Testing authentication with remote database...');
    
    // Try to sign in with a test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@g.com',
      password: 'Dan@2020',
    });
    
    if (error) {
      console.error('Sign in error:', error.message);
      return;
    }
    
    console.log('Sign in successful!');
    console.log('User ID:', data.user.id);
    
    // Check the user's profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile fetch error:', profileError.message);
      return;
    }
    
    console.log('User role:', profile.role);
    
    if (profile.role === 'admin') {
      console.log('✓ User has admin role');
    } else {
      console.log('✗ User does not have admin role');
    }
    
    // Sign out
    await supabase.auth.signOut();
    console.log('Signed out successfully');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAuth();