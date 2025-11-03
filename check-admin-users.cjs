const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MjIyOSwiZXhwIjoyMDc2MzY4MjI5fQ.CmX4F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fX';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Service Key:', supabaseServiceKey ? '[REDACTED]' : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

// Create Supabase client with service role key for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function checkAdminUsers() {
  try {
    console.log('Checking for admin users in the database...');
    
    // Check for users with admin role
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error fetching admin users:', error.message);
      return;
    }
    
    console.log(`Found ${users.length} admin users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('---');
    });
    
    // Also check all users
    console.log('\nChecking all users...');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allUsersError) {
      console.error('Error fetching all users:', allUsersError.message);
      return;
    }
    
    console.log(`Found ${allUsers.length} total users:`);
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAdminUsers();