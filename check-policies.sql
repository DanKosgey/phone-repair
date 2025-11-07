-- Check RLS status and policies for profiles table
SELECT 
    tablename, 
    relrowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Check policies on profiles table
SELECT 
    polname as policy_name,
    polcmd as command,
    polqual as policy_condition
FROM pg_policy 
WHERE polrelid = 'profiles'::regclass;

-- Check if the specific policy exists
SELECT count(*) as policy_count
FROM pg_policy 
WHERE polrelid = 'profiles'::regclass 
AND polname = 'Users can view own profile';