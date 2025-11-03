-- Create materialized views for dashboard metrics to improve performance

-- Materialized view for ticket status distribution
CREATE MATERIALIZED VIEW public.ticket_status_distribution AS
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM public.tickets), 2) as percentage
FROM public.tickets
GROUP BY status
ORDER BY count DESC;

-- Materialized view for monthly ticket trends
CREATE MATERIALIZED VIEW public.monthly_ticket_trends AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as ticket_count,
  COUNT(DISTINCT user_id) as unique_customers,
  COALESCE(SUM(final_cost), 0) as total_revenue
FROM public.tickets
WHERE created_at >= NOW() - INTERVAL '24 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month;

-- Materialized view for top products by sales
CREATE MATERIALIZED VIEW public.top_products_by_sales AS
SELECT 
  p.id,
  p.name,
  p.category,
  COUNT(oi.id) as total_orders,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.price_per_unit * oi.quantity) as total_revenue,
  AVG(oi.price_per_unit) as average_price
FROM public.products p
JOIN public.order_items oi ON p.id = oi.product_id
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC
LIMIT 20;

-- Materialized view for customer lifetime value
CREATE MATERIALIZED VIEW public.customer_lifetime_value AS
SELECT 
  c.id,
  c.name,
  c.email,
  COUNT(DISTINCT t.id) as total_tickets,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(t.final_cost), 0) as repair_revenue,
  COALESCE(SUM(o.total_amount), 0) as product_revenue,
  COALESCE(SUM(t.final_cost), 0) + COALESCE(SUM(o.total_amount), 0) as total_lifetime_value,
  MAX(GREATEST(t.updated_at, o.updated_at)) as last_activity
FROM public.customers c
LEFT JOIN public.tickets t ON c.user_id = t.user_id
LEFT JOIN public.orders o ON c.user_id = o.user_id
GROUP BY c.id, c.name, c.email
ORDER BY total_lifetime_value DESC;

-- Materialized view for inventory status
CREATE MATERIALIZED VIEW public.inventory_status AS
SELECT 
  category,
  COUNT(*) as total_products,
  COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock,
  COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= 5 THEN 1 END) as low_stock,
  AVG(stock_quantity) as avg_stock_level,
  SUM(stock_quantity * price) as total_inventory_value
FROM public.products
GROUP BY category
ORDER BY total_inventory_value DESC;

-- Create indexes on materialized views for better performance
CREATE INDEX idx_ticket_status_distribution_status ON public.ticket_status_distribution(status);
CREATE INDEX idx_monthly_ticket_trends_month ON public.monthly_ticket_trends(month);
CREATE INDEX idx_top_products_by_sales_category ON public.top_products_by_sales(category);
CREATE INDEX idx_customer_lifetime_value_value ON public.customer_lifetime_value(total_lifetime_value);
CREATE INDEX idx_inventory_status_category ON public.inventory_status(category);

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION public.refresh_dashboard_materialized_views()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.ticket_status_distribution;
  REFRESH MATERIALIZED VIEW public.monthly_ticket_trends;
  REFRESH MATERIALIZED VIEW public.top_products_by_sales;
  REFRESH MATERIALIZED VIEW public.customer_lifetime_value;
  REFRESH MATERIALIZED VIEW public.inventory_status;
END;
$$ LANGUAGE plpgsql;

-- Grant SELECT permissions on materialized views
GRANT SELECT ON public.ticket_status_distribution TO authenticated;
GRANT SELECT ON public.monthly_ticket_trends TO authenticated;
GRANT SELECT ON public.top_products_by_sales TO authenticated;
GRANT SELECT ON public.customer_lifetime_value TO authenticated;
GRANT SELECT ON public.inventory_status TO authenticated;