-- Migration 041: Add RLS policies for customers table
-- Description: Add Row Level Security policies for the customers table

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can create customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can update customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;

-- Admins can view all customers
CREATE POLICY "Admins can view all customers" ON public.customers
FOR SELECT USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Authenticated users can create customers
CREATE POLICY "Authenticated users can create customers" ON public.customers
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Admins can update customers
CREATE POLICY "Admins can update customers" ON public.customers
FOR UPDATE USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Admins can delete customers
CREATE POLICY "Admins can delete customers" ON public.customers
FOR DELETE USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;