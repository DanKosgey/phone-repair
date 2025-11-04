-- Function to get daily ticket trends data
CREATE OR REPLACE FUNCTION public.get_daily_ticket_trends()
RETURNS TABLE(
  date DATE,
  ticket_count BIGINT,
  unique_customers BIGINT,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dt.date,
    dt.ticket_count,
    dt.unique_customers,
    dt.total_revenue
  FROM public.daily_ticket_trends dt
  ORDER BY dt.date ASC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_daily_ticket_trends() TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.get_daily_ticket_trends() IS 'Returns daily ticket trends data for dashboard visualization';