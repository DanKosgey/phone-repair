const { createClient } = require('@supabase/supabase-js');

// Use your remote database configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MjIyOSwiZXhwIjoyMDc2MzY4MjI5fQ.CmX4F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fX';

console.log('Connecting to Supabase at:', supabaseUrl);

// Create Supabase client with service role key for full access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function checkUsers() {
  try {
    console.log('Fetching users from remote database...');
    
    // First check if we can connect by getting the count
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error connecting to database:', countError.message);
      return;
    }
    
    console.log(`Total profiles in database: ${count}`);
    
    if (count === 0) {
      console.log('No profiles found in the database');
      return;
    }
    
    // Check all users
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10); // Limit to 10 to avoid overwhelming output
    
    if (error) {
      console.error('Error fetching users:', error.message);
      return;
    }
    
    console.log(`Displaying up to ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'NULL'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log('---');
    });
    
    // Check specifically for admin users
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(10);
    
    if (adminError) {
      console.error('Error fetching admin users:', adminError.message);
      return;
    }
    
    console.log(`\nFound ${adminUsers.length} admin users:`);
    if (adminUsers.length === 0) {
      console.log('No admin users found');
    } else {
      adminUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} (${user.id})`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkUsers();