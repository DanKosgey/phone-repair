-- Fix RLS policies for notifications table to allow anonymous users to insert notifications
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON public.notifications;

-- Create new policies with proper permissions
CREATE POLICY "Anyone can insert notifications" 
ON public.notifications 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Admins can view all notifications" 
ON public.notifications 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins can update notifications" 
ON public.notifications 
FOR UPDATE 
TO authenticated 
USING (true);

-- Grant necessary permissions
GRANT INSERT ON public.notifications TO anon;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;