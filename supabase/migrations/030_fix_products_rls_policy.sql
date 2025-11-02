-- Migration 030: Fix products RLS policy to use profiles table for role checking
-- Description: Update products RLS policies to check role from profiles table directly instead of JWT claims

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