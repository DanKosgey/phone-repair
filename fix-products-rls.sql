-- SQL script to fix products RLS policies
-- This script should be run in the Supabase SQL editor

-- Drop existing policies for products table
DROP POLICY IF EXISTS "Public can view all products" ON public.products;
DROP POLICY IF EXISTS "Only admins can create products" ON public.products;
DROP POLICY IF EXISTS "Admins can create products" ON public.products;
DROP POLICY IF EXISTS "Only admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Create updated policies for products table
-- Anyone can view products (public access)
CREATE POLICY "Public can view products" ON public.products
FOR SELECT USING (true);

-- Only admins can create products
-- Check role from profiles table directly for better security and consistency
CREATE POLICY "Admins can create products" ON public.products
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Only admins can update products
CREATE POLICY "Admins can update products" ON public.products
FOR UPDATE USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Only admins can delete products
CREATE POLICY "Admins can delete products" ON public.products
FOR DELETE USING (
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- Verify the policies were created
SELECT tablename, policyname, permissive, roles, cmd FROM pg_policies WHERE tablename = 'products';