-- Migration 040: Add indexes for customer search
-- Description: Add indexes to improve customer search performance by name, email, and phone

-- Create indexes for customer search fields
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_name_lower ON public.customers(LOWER(name));
CREATE INDEX IF NOT EXISTS idx_customers_email_lower ON public.customers(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);

-- Add comment for documentation
COMMENT ON INDEX idx_customers_name IS 'Index for customer name search';
COMMENT ON INDEX idx_customers_name_lower IS 'Index for case-insensitive customer name search';
COMMENT ON INDEX idx_customers_email_lower IS 'Index for case-insensitive customer email search';
COMMENT ON INDEX idx_customers_phone IS 'Index for customer phone search';