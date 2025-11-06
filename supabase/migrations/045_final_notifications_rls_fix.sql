-- Final fix for notifications table RLS policies to ensure anonymous insert works
-- This completely resets and reconfigures the policies

-- First, ensure the table exists
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow insert for all users" ON public.notifications;
DROP POLICY IF EXISTS "Enable insert for anon" ON public.notifications;
DROP POLICY IF EXISTS "Enable insert access for anon" ON public.notifications;
DROP POLICY IF EXISTS "Allow admins to view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow admins to update notifications" ON public.notifications;

-- Ensure RLS is enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create simple, permissive policies
CREATE POLICY "Allow anonymous insert" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated select" 
ON public.notifications 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated update" 
ON public.notifications 
FOR UPDATE 
TO authenticated 
USING (true);

-- Grant permissions
GRANT INSERT ON public.notifications TO anon;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO postgres;