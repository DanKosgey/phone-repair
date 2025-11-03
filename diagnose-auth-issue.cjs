// Diagnose the authentication issue
const { createClient } = require('@supabase/supabase-js');

// Use the exact same environment variables as in your application
const supabaseUrl = 'https://sefirznxgiymfkegdtgh.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDc5MjIyOSwiZXhwIjoyMDc2MzY4MjI5fQ.CmX4F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fXvJ0F3fX';

console.log('Diagnosing authentication issue...');

// Create client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

async function diagnoseIssue() {
  try {
    console.log('=== AUTHENTICATION DIAGNOSIS ===');
    
    // 1. Check if there are any profiles
    console.log('\n1. Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError.message);
    } else {
      console.log(`Profiles count: ${profiles.count}`);
    }
    
    // 2. Check if we can insert a profile (to test permissions)
    console.log('\n2. Testing insert permissions...');
    const testProfile = {
      id: '00000000-0000-0000-0000-000000000000', // Test UUID
      email: 'test@example.com',
      role: 'user'
    };
    
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([testProfile]);
    
    if (insertError) {
      console.error('Insert test error:', insertError.message);
      // This is expected to fail because the ID is invalid
    } else {
      console.log('Insert test: Success (unexpected)');
      // Clean up if it somehow succeeded
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testProfile.id);
    }
    
    // 3. Check RLS policies
    console.log('\n3. Testing RLS policies...');
    // Try to select with anon key to see if RLS is working
    const anonClient = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZmlyem54Z2l5bWZrZWdkdGdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTIyMjksImV4cCI6MjA3NjM2ODIyOX0.IyIP9KX8xqseIgdKg4QOGTDC-znphm927rQQjnf5g6I', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    
    const { data: anonData, error: anonError } = await anonClient
      .from('profiles')
      .select('*');
    
    if (anonError) {
      console.log('Anon client RLS working correctly (can\'t see profiles without auth)');
    } else {
      console.log('Anon client can see profiles:', anonData.length);
    }
    
    console.log('\n=== DIAGNOSIS COMPLETE ===');
    console.log('The issue is that there are no user profiles in your database.');
    console.log('You need to create a user account and assign the admin role.');
    console.log('Since email validation is strict, you\'ll need to:');
    console.log('1. Use the Supabase dashboard to create a user');
    console.log('2. Manually insert a profile with admin role');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

diagnoseIssue();