-- Migration 028: Fix tickets RLS policy to check role from profiles table
-- Description: Update the RLS policy for tickets table to check the user's role from the profiles table instead of JWT

-- Drop the existing policy
DROP POLICY IF EXISTS "Only admins can create tickets" ON public.tickets;

-- Create a new policy that checks the role from the profiles table
CREATE POLICY "Only admins can create tickets" ON public.tickets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);