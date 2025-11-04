-- Create views for common queries

-- View for ticket summary with customer information
CREATE OR REPLACE VIEW public.ticket_summary AS
SELECT 
  t.id,
  t.ticket_number,
  t.customer_name,
  t.device_type,
  t.device_brand,
  t.device_model,
  t.status,
  t.priority,
  t.estimated_cost,
  t.final_cost,
  t.created_at,
  t.updated_at,
  p.email as customer_email
FROM public.tickets t
LEFT JOIN public.profiles p ON t.user_id = p.id;

-- View for product sales summary
CREATE OR REPLACE VIEW public.product_sales_summary AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  p.stock_quantity,
  COUNT(oi.id) as total_sold,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.price_per_unit * oi.quantity) as total_revenue
FROM public.products p
LEFT JOIN public.order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.category, p.price, p.stock_quantity;

-- View for order details with items
CREATE OR REPLACE VIEW public.order_details AS
SELECT 
  o.id as order_id,
  o.order_number,
  o.customer_name,
  o.status,
  o.total_amount,
  o.created_at,
  oi.id as item_id,
  oi.product_id,
  oi.quantity,
  oi.price_per_unit,
  p.name as product_name
FROM public.orders o
JOIN public.order_items oi ON o.id = oi.order_id
JOIN public.products p ON oi.product_id = p.id;

-- View for customer activity summary
CREATE OR REPLACE VIEW public.customer_summary AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  COUNT(DISTINCT t.id) as total_tickets,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(t.final_cost), 0) as total_spent_on_repairs,
  COALESCE(SUM(o.total_amount), 0) as total_spent_on_products,
  COALESCE(SUM(t.final_cost), 0) + COALESCE(SUM(o.total_amount), 0) as total_lifetime_value,
  MAX(GREATEST(t.updated_at, o.updated_at)) as last_activity
FROM public.customers c
LEFT JOIN public.tickets t ON c.user_id = t.user_id
LEFT JOIN public.orders o ON c.user_id = o.user_id
GROUP BY c.id, c.name, c.email, c.phone;

-- View for admin dashboard metrics
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

-- Grant SELECT permissions on views
GRANT SELECT ON public.ticket_summary TO authenticated;
GRANT SELECT ON public.product_sales_summary TO authenticated;
GRANT SELECT ON public.order_details TO authenticated;
GRANT SELECT ON public.customer_summary TO authenticated;
GRANT SELECT ON public.admin_dashboard_metrics TO authenticated;