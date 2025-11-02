-- Create storage bucket for second-hand product images
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('secondhand', 'secondhand', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can upload secondhand images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view secondhand images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update secondhand images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete secondhand images" ON storage.objects;

-- Storage policies for secondhand bucket
CREATE POLICY "Admins can upload secondhand images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'secondhand' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR 
    -- Allow service role key access
    current_user = 'authenticator' AND current_setting('role') = 'service_role'
  )
);

CREATE POLICY "Anyone can view secondhand images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'secondhand');

CREATE POLICY "Admins can update secondhand images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'secondhand' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR 
    -- Allow service role key access
    current_user = 'authenticator' AND current_setting('role') = 'service_role'
  )
);

CREATE POLICY "Admins can delete secondhand images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'secondhand' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR 
    -- Allow service role key access
    current_user = 'authenticator' AND current_setting('role') = 'service_role'
  )
);