-- Migration 037: Add customer_id column to tickets table
-- Description: Create a proper foreign key relationship between tickets and customers for better customer management

-- Add customer_id column to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON public.tickets(customer_id);

-- Add helpful comment for documentation
COMMENT ON COLUMN public.tickets.customer_id IS 'Foreign key linking ticket to customer for repair services';

-- Update existing tickets to link to customers where possible
-- This will match customers based on email or phone number
UPDATE public.tickets 
SET customer_id = c.id
FROM public.customers c
WHERE public.tickets.customer_id IS NULL 
  AND (
    (public.tickets.customer_email IS NOT NULL AND public.tickets.customer_email = c.email) OR
    (public.tickets.customer_phone IS NOT NULL AND public.tickets.customer_phone = c.phone)
  );

-- For any remaining tickets without a customer link, create customer records
-- and link them to the tickets
-- This will be handled by the application logic during data migration

-- Grant necessary permissions for the new column
GRANT SELECT, INSERT, UPDATE ON public.tickets TO authenticated;