-- Fix profiles table policies to allow users to view their own profile
-- The current policy only allows admins to view profiles, which creates a circular dependency
-- since we need to fetch the profile to know the role

-- First, add a policy that allows users to view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- The existing "Admins can view all profiles" policy will remain for admin users

