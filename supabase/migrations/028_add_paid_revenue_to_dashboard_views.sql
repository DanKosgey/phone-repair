-- Migration 028: Add paid-only revenue metrics to dashboard views
-- Description: Add paid_repair_revenue field to admin_dashboard_metrics view for analytics

-- Update the admin_dashboard_metrics view to include paid-only revenue calculations
CREATE OR REPLACE VIEW public.admin_dashboard_metrics AS
SELECT 
  -- Ticket metrics
  (SELECT COUNT(*) FROM public.tickets WHERE status = 'received') as tickets_received,
  (SELECT COUNT(*) FROM public.tickets WHERE status = 'diagnosing') as tickets_diagnosing,
  (SELECT COUNT(*) FROM public.tickets WHERE status = 'repairing') as tickets_repairing,
  (SELECT COUNT(*) FROM public.tickets WHERE status = 'ready') as tickets_ready,
  (SELECT COUNT(*) FROM public.tickets WHERE status = 'completed') as tickets_completed,
  
  -- Order metrics
  (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as orders_pending,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'shipped') as orders_shipped,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'delivered') as orders_delivered,
  
  -- Product metrics
  (SELECT COUNT(*) FROM public.products) as total_products,
  (SELECT COUNT(*) FROM public.products WHERE stock_quantity = 0 OR stock_quantity IS NULL) as out_of_stock_products,
  
  -- Customer metrics
  (SELECT COUNT(*) FROM public.customers) as total_customers,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as total_admins,
  
  -- Financial metrics - ORIGINAL (all completed tickets)
  (SELECT COALESCE(SUM(final_cost), 0) FROM public.tickets WHERE status = 'completed') as total_repair_revenue,
  (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status = 'delivered') as total_product_revenue,
  
  -- Financial metrics - NEW (only paid tickets and orders)
  (SELECT COALESCE(SUM(final_cost), 0) FROM public.tickets WHERE status = 'completed' AND payment_status = 'paid') as paid_repair_revenue,
  (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status = 'delivered') as paid_product_revenue;

-- Grant SELECT permissions on the updated view
GRANT SELECT ON public.admin_dashboard_metrics TO authenticated;