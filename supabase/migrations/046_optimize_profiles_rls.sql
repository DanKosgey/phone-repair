-- Migration 046: Optimize RLS policies for profiles table
-- Description: Simplify the RLS policies to improve query performance by removing subqueries

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create simplified policies that don't use subqueries
-- Users can only read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Admins can read all profiles (handled by application logic)
-- This policy will be used when we check for admin role in the application

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Keep existing admin policies for DELETE operations
-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
FOR DELETE USING (EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

-- Add index for better performance on role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);