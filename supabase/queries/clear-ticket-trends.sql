-- SQL queries to clear or reset ticket trend data

-- 1. Refresh materialized views to show current data
-- This is the safest approach - it updates the trends to reflect current ticket data
REFRESH MATERIALIZED VIEW public.ticket_status_distribution;
REFRESH MATERIALIZED VIEW public.daily_ticket_trends;

-- 2. Check current ticket trends
SELECT * FROM public.ticket_status_distribution;
SELECT * FROM public.daily_ticket_trends ORDER BY date DESC LIMIT 10;

-- 3. If you want to completely clear all ticket data (DANGEROUS!)
-- WARNING: This will permanently delete all tickets from your database
-- Uncomment the following lines only if you really want to delete all tickets:

/*
-- Soft delete all tickets (recommended approach)
UPDATE public.tickets 
SET deleted_at = NOW() 
WHERE deleted_at IS NULL;

-- Refresh materialized views after deletion
REFRESH MATERIALIZED VIEW public.ticket_status_distribution;
REFRESH MATERIALIZED VIEW public.daily_ticket_trends;

-- Verify that tickets are marked as deleted
SELECT COUNT(*) as total_tickets FROM public.tickets WHERE deleted_at IS NULL;
*/

-- 4. Alternative: Hard delete all tickets (VERY DANGEROUS!)
-- This completely removes all ticket data from the database
-- Uncomment the following lines only if you really want to permanently delete all tickets:

/*
-- Delete all tickets
DELETE FROM public.tickets;

-- Refresh materialized views after deletion
REFRESH MATERIALIZED VIEW public.ticket_status_distribution;
REFRESH MATERIALIZED VIEW public.daily_ticket_trends;

-- Verify that all tickets are deleted
SELECT COUNT(*) as total_tickets FROM public.tickets;
*/

-- 5. Check ticket count by status after clearing
SELECT status, COUNT(*) as count 
FROM public.tickets 
WHERE deleted_at IS NULL 
GROUP BY status 
ORDER BY count DESC;