const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Migration SQL
const migrationSQL = `
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
`;

async function applyMigration() {
  console.log('Applying migration to fix products RLS policy...');
  
  try {
    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration:', error);
      process.exit(1);
    }
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

applyMigration();