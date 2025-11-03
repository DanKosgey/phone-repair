const { createClient } = require('@supabase/supabase-js');

// Use your remote database configuration from .env.local
const supabaseUrl = 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MjIyOSwiZXhwIjoyMDc2MzY4MjI5fQ.CmX4F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fX';

console.log('Checking existing users in Supabase at:', supabaseUrl);

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function checkExistingUsers() {
  try {
    console.log('Fetching existing users...');
    
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(20);
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError.message);
      return;
    }
    
    console.log(`Found ${profiles.length} profiles:`);
    if (profiles.length === 0) {
      console.log('No profiles found in the database');
    } else {
      profiles.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role || 'NULL'}`);
        console.log(`   Created: ${profile.created_at}`);
        console.log('---');
      });
    }
    
    // Get auth users (if possible)
    console.log('\nChecking auth users...');
    // Note: We can't directly query auth.users with the service key
    // But we can check if any profiles exist without corresponding auth users
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkExistingUsers();