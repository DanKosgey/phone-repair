const { createClient } = require('@supabase/supabase-js');

// Use your remote database configuration from .env.local
const supabaseUrl = 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTIyMjksImV4cCI6MjA3NjM2ODIyOX0.IyIP9KX8xqseIgdKg4QOGTDC-znphm927rQQjnf5g6I';

console.log('Testing connection to Supabase at:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try a simple query to test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection failed:', error.message);
      console.error('Error details:', error);
      return;
    }
    
    console.log('Connection successful!');
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testConnection();