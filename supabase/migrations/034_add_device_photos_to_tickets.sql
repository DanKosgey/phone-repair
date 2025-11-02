-- Add device_photos column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS device_photos TEXT[];

-- Initialize the column as an empty array for existing rows
UPDATE public.tickets 
SET device_photos = '{}' 
WHERE device_photos IS NULL;