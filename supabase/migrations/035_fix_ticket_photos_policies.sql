-- Fix ticket photos storage policies to ensure public access
-- First, drop all existing policies on the storage.objects table
DROP POLICY IF EXISTS "Admins can upload ticket photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view ticket photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update ticket photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete ticket photos" ON storage.objects;

-- Recreate policies with proper permissions
CREATE POLICY "Admins can upload ticket photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ticket-photos' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);

CREATE POLICY "Anyone can view ticket photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-photos');

CREATE POLICY "Admins can update ticket photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ticket-photos' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);

CREATE POLICY "Admins can delete ticket photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ticket-photos' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
);

-- Ensure the bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'ticket-photos';