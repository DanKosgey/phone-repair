-- Create storage bucket for ticket photos
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('ticket-photos', 'ticket-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload ticket photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own ticket photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all ticket photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own ticket photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own ticket photos" ON storage.objects;

-- Storage policies for ticket-photos bucket
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
    OR 
    -- Allow service role key access
    current_user = 'authenticator' AND current_setting('role') = 'service_role'
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
    OR 
    -- Allow service role key access
    current_user = 'authenticator' AND current_setting('role') = 'service_role'
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
    OR 
    -- Allow service role key access
    current_user = 'authenticator' AND current_setting('role') = 'service_role'
  )
);