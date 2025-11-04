-- Script to clear ticket trend data from materialized views
-- This will refresh the materialized views with current data from the tickets table

-- Refresh ticket status distribution view
REFRESH MATERIALIZED VIEW public.ticket_status_distribution;

-- Refresh daily ticket trends view
REFRESH MATERIALIZED VIEW public.daily_ticket_trends;

-- Refresh all dashboard materialized views (including ticket-related ones)
-- This is the recommended approach as it ensures consistency across all views
SELECT public.refresh_dashboard_materialized_views();

-- Alternative: If you want to completely clear the data (show zero tickets),
-- you would need to temporarily remove all tickets from the tickets table
-- and then refresh the views. But this is NOT recommended as it deletes real data.
--
-- Example of clearing data (DANGEROUS - do not run unless you really want to delete all tickets):
-- DELETE FROM public.tickets;
-- REFRESH MATERIALIZED VIEW public.ticket_status_distribution;
-- REFRESH MATERIALIZED VIEW public.daily_ticket_trends;

-- To verify the views have been refreshed, you can check their contents:
-- SELECT * FROM public.ticket_status_distribution;
-- SELECT * FROM public.daily_ticket_trends ORDER BY date DESC LIMIT 10;