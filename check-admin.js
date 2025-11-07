import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: '.env.local' });

// Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

// Check if we have the required configuration
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminUser() {
  try {
    console.log('Checking admin user...');
    
    // Query the profiles table for the admin user
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('email', 'admin@g.com')
      .single();

    if (error) {
      console.error('Error querying profile:', error);
      return;
    }

    if (data) {
      console.log('Admin user found:');
      console.log('- ID:', data.id);
      console.log('- Email:', data.email);
      console.log('- Role:', data.role);
      
      if (data.role === 'admin') {
        console.log('✅ User has admin role - ready for admin dashboard access');
      } else {
        console.log('❌ User does not have admin role');
      }
    } else {
      console.log('Admin user not found in profiles table');
    }
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

checkAdminUser();