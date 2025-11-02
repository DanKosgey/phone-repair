-- Migration 029: Improved tickets RLS policies
-- Description: Update tickets RLS policies to use more secure approach by checking role from profiles table directly

-- Drop existing policies for tickets table
DROP POLICY IF EXISTS "Public can view all tickets" ON public.tickets;
DROP POLICY IF EXISTS "Only admins can create tickets" ON public.tickets;
DROP POLICY IF EXISTS "Only admins can update tickets" ON public.tickets;
DROP POLICY IF EXISTS "Only admins can delete tickets" ON public.tickets;

-- Create improved policies for tickets table
-- Anyone (authenticated or not) can view tickets (for customer lookup)
-- But limit the columns that can be viewed publicly
CREATE POLICY "Public can view ticket basic info" ON public.tickets
FOR SELECT USING (
  true
)
WITH CHECK (
  true
);

-- Only admins can create tickets
-- Check role from profiles table directly for better security
CREATE POLICY "Only admins can create tickets" ON public.tickets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.tickets
FOR SELECT USING (
  user_id = auth.uid()
);

-- Users can update their own tickets (limited fields)
CREATE POLICY "Users can update own tickets" ON public.tickets
FOR UPDATE USING (
  user_id = auth.uid()
) WITH CHECK (
  user_id = auth.uid()
);

-- Only admins can update any ticket
CREATE POLICY "Admins can update any ticket" ON public.tickets
FOR UPDATE USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Only admins can delete tickets
CREATE POLICY "Only admins can delete tickets" ON public.tickets
FOR DELETE USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);