-- Apply the fix for profiles RLS policy directly

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create simplified policies that don't use subqueries
-- Users can only read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Verify the policies were created
SELECT polname as policy_name, polcmd as command, polqual as policy_condition
FROM pg_policy 
WHERE polrelid = 'profiles'::regclass;