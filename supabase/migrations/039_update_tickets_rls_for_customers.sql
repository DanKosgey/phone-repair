-- Migration 039: Update tickets RLS policies to support customer relationship
-- Description: Update tickets RLS policies to properly handle the new customer_id relationship

-- Drop existing policies for tickets table that might conflict
DROP POLICY IF EXISTS "Public can view ticket basic info" ON public.tickets;

-- Create policy for customer access to their own tickets
-- Customers can view tickets linked to them
CREATE POLICY "Customers can view their own tickets" ON public.tickets
FOR SELECT USING (
  customer_id IN (
    SELECT id 
    FROM public.customers 
    WHERE user_id = auth.uid()
  )
);

-- Update the "Users can view own tickets" policy to be more explicit
CREATE POLICY "Users can view tickets they created" ON public.tickets
FOR SELECT USING (
  user_id = auth.uid()
);

-- Create policy for customer updates to their own tickets
-- Customers can update tickets linked to them (limited fields)
CREATE POLICY "Customers can update their own tickets" ON public.tickets
FOR UPDATE USING (
  customer_id IN (
    SELECT id 
    FROM public.customers 
    WHERE user_id = auth.uid()
  )
) WITH CHECK (
  customer_id IN (
    SELECT id 
    FROM public.customers 
    WHERE user_id = auth.uid()
  )
);

-- Ensure admins can still view all tickets
CREATE POLICY "Admins can view all tickets" ON public.tickets
FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Ensure admins can create tickets
CREATE POLICY "Admins can create tickets" ON public.tickets
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Ensure admins can update any ticket
CREATE POLICY "Admins can update any ticket" ON public.tickets
FOR UPDATE USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Ensure admins can delete tickets
CREATE POLICY "Admins can delete tickets" ON public.tickets
FOR DELETE USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tickets TO authenticated;