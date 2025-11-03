// Test the exact same configuration as used in the application
const { createClient } = require('@supabase/supabase-js');

// Use the exact same environment variables as in your application
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTIyMjksImV4cCI6MjA3NjM2ODIyOX0.IyIP9KX8xqseIgdKg4QOGTDC-znphm927rQQjnf5g6I';

console.log('Testing with application configuration:');
console.log('Supabase URL:', supabaseUrl);

// Create client exactly as in src/server/supabase/client.ts
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
    } else {
      console.log('Session status:', session ? 'Active' : 'None');
    }
    
    // Try a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(5);
    
    if (error) {
      console.error('Query error:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error);
    } else {
      console.log('Query successful!');
      console.log('Data:', data);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testAuth();