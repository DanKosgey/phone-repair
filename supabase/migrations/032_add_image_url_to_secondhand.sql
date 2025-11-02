-- Add image_url column to second_hand_products table
ALTER TABLE public.second_hand_products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add constraint to ensure image_url is either empty or a valid URL
ALTER TABLE public.second_hand_products 
ADD CONSTRAINT chk_second_hand_products_image_url_format 
CHECK (image_url = '' OR image_url ~* '^https?://');