-- Comprehensive script to reset ticket trend data
-- Choose the approach that best fits your needs

-- APPROACH 1: Refresh materialized views to show current data
-- This updates the trend data to reflect the current state of tickets in the database
REFRESH MATERIALIZED VIEW public.ticket_status_distribution;
REFRESH MATERIALIZED VIEW public.daily_ticket_trends;

-- APPROACH 2: Clear all ticket data from the database (DANGEROUS!)
-- Only uncomment and run these lines if you really want to delete all tickets
/*
DELETE FROM public.tickets;
REFRESH MATERIALIZED VIEW public.ticket_status_distribution;
REFRESH MATERIALIZED VIEW public.daily_ticket_trends;
*/

-- APPROACH 3: Create temporary empty views for testing purposes
-- This approach creates temporary views with no data for testing
/*
DROP MATERIALIZED VIEW IF EXISTS temp_empty_ticket_status_distribution;
CREATE MATERIALIZED VIEW temp_empty_ticket_status_distribution AS
SELECT 
  status,
  0 as count,
  0.00 as percentage
FROM (SELECT DISTINCT status FROM public.tickets) t
WHERE false;

DROP MATERIALIZED VIEW IF EXISTS temp_empty_daily_ticket_trends;
CREATE MATERIALIZED VIEW temp_empty_daily_ticket_trends AS
SELECT 
  CURRENT_DATE as date,
  0 as ticket_count,
  0 as unique_customers,
  0 as total_revenue
WHERE false;
*/

-- APPROACH 4: Reset auto-increment sequences if needed
-- This is typically not needed for UUID primary keys, but included for completeness
/*
-- If tickets table had serial IDs, you might reset the sequence:
-- SELECT setval('tickets_id_seq', 1, false);
*/

-- Verification queries to check the current state
-- Uncomment to run after executing one of the above approaches:

-- Check ticket status distribution
-- SELECT * FROM public.ticket_status_distribution;

-- Check recent daily ticket trends
-- SELECT * FROM public.daily_ticket_trends ORDER BY date DESC LIMIT 10;

-- Check total ticket count
-- SELECT COUNT(*) as total_tickets FROM public.tickets;

-- Check ticket count by status
-- SELECT status, COUNT(*) as count FROM public.tickets GROUP BY status;