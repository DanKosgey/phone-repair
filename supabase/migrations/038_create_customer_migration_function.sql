-- Migration 038: Create function to migrate existing ticket customers to customer table
-- Description: Create a stored procedure to handle migration of existing ticket customer data to the customers table

-- Create function to migrate ticket customers to customers table
CREATE OR REPLACE FUNCTION public.migrate_ticket_customers_to_customers()
RETURNS TABLE(
    migrated_count INTEGER,
    created_count INTEGER,
    linked_count INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_migrated_count INTEGER := 0;
    v_created_count INTEGER := 0;
    v_linked_count INTEGER := 0;
    v_ticket RECORD;
    v_customer_id UUID;
BEGIN
    -- Process tickets that don't have a customer_id but have customer information
    FOR v_ticket IN 
        SELECT id, customer_name, customer_email, customer_phone
        FROM public.tickets
        WHERE customer_id IS NULL 
          AND (customer_name IS NOT NULL OR customer_email IS NOT NULL OR customer_phone IS NOT NULL)
    LOOP
        -- Try to find existing customer by email
        IF v_ticket.customer_email IS NOT NULL THEN
            SELECT id INTO v_customer_id
            FROM public.customers
            WHERE email = v_ticket.customer_email
            LIMIT 1;
        END IF;
        
        -- If not found by email, try to find by phone
        IF v_customer_id IS NULL AND v_ticket.customer_phone IS NOT NULL THEN
            SELECT id INTO v_customer_id
            FROM public.customers
            WHERE phone = v_ticket.customer_phone
            LIMIT 1;
        END IF;
        
        -- If still not found, create new customer
        IF v_customer_id IS NULL THEN
            INSERT INTO public.customers (name, email, phone)
            VALUES (
                COALESCE(v_ticket.customer_name, 'Unknown Customer'),
                v_ticket.customer_email,
                v_ticket.customer_phone
            )
            RETURNING id INTO v_customer_id;
            
            v_created_count := v_created_count + 1;
        ELSE
            v_linked_count := v_linked_count + 1;
        END IF;
        
        -- Link ticket to customer
        UPDATE public.tickets
        SET customer_id = v_customer_id
        WHERE id = v_ticket.id;
        
        v_migrated_count := v_migrated_count + 1;
    END LOOP;
    
    -- Return migration statistics
    RETURN QUERY SELECT v_migrated_count, v_created_count, v_linked_count;
END;
$$;

-- Add comment for documentation
COMMENT ON FUNCTION public.migrate_ticket_customers_to_customers() IS 'Migrate existing ticket customer data to customers table and link tickets to customers';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.migrate_ticket_customers_to_customers() TO authenticated;