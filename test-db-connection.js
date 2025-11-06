// Simple script to test database connection and role fetching
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Try to fetch a simple record
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(1);

    if (error) {
      console.error('Error fetching profiles:', error);
      return;
    }

    console.log('Successfully fetched profiles:', data);
    
    // Try to find admin user
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('role', 'admin')
      .limit(1);

    if (adminError) {
      console.error('Error fetching admin profiles:', adminError);
      return;
    }

    console.log('Admin profiles found:', adminData);
    
  } catch (error) {
    console.error('Exception during test:', error);
  }
}

testConnection();