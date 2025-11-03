import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

// Define types for materialized views that may not be in the auto-generated types
interface MonthlyTicketTrends {
  month: string
  ticket_count: number
  unique_customers: number
  total_revenue: number
}

interface TicketStatusDistribution {
  status: string
  count: number
  percentage: number
}

interface TopProductsBySales {
  id: string
  name: string
  category: string
  total_orders: number
  total_quantity_sold: number
  total_revenue: number
  average_price: number
}

interface InventoryStatus {
  category: string | null
  total_products: number | null
  out_of_stock: number | null
  low_stock: number | null
  avg_stock_level: number | null
  total_inventory_value: number | null
}

interface YearOverYearData {
  month: string;
  current_year_tickets: number;
  previous_year_tickets: number;
  current_year_revenue: number;
  previous_year_revenue: number;
  ticket_growth_rate: number;
  revenue_growth_rate: number;
}

interface ForecastData {
  month: string;
  predicted_tickets: number;
  predicted_revenue: number;
  confidence_lower: number;
  confidence_upper: number;
}

export const dashboardDb = {
  // Get admin dashboard metrics
  async getAdminMetrics() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('admin_dashboard_metrics')
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  // Get ticket summary
  async getTicketSummary() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('ticket_summary')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data
  },

  // Get customer summary
  async getCustomerSummary() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('customer_summary')
      .select('*')
      .order('last_activity', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data
  },

  // Get product sales summary
  async getProductSalesSummary() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('product_sales_summary')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data
  },

  // Get order details
  async getOrderDetails() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('order_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data
  },

  // Get monthly revenue trends
  async getMonthlyRevenueTrends() {
    const supabase = getSupabaseBrowserClient()
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('monthly_ticket_trends')
      .select('*')
      .order('month', { ascending: true })
    
    if (error) throw error
    return data as MonthlyTicketTrends[]
  },

  // Get ticket status distribution
  async getTicketStatusDistribution() {
    const supabase = getSupabaseBrowserClient()
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('ticket_status_distribution')
      .select('*')
    
    if (error) throw error
    return data as TicketStatusDistribution[]
  },

  // Get top products by sales
  async getTopProductsBySales() {
    const supabase = getSupabaseBrowserClient()
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('top_products_by_sales')
      .select('*')
      .order('total_revenue', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data as TopProductsBySales[]
  },

  // Get inventory status
  async getInventoryStatus() {
    const supabase = getSupabaseBrowserClient()
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('inventory_status')
      .select('*')
      .order('total_inventory_value', { ascending: false })
    
    if (error) throw error
    return data as InventoryStatus[];
  },

  // Get year-over-year comparison data
  async getYearOverYearComparison() {
    const supabase = getSupabaseBrowserClient();
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('monthly_ticket_trends')
      .select('*')
      .order('month', { ascending: true });
    
    if (error) throw error;
    
    // Process data for year-over-year comparison
    const processedData: YearOverYearData[] = [];
    
    // Group data by month (ignoring year)
    const monthlyData: Record<string, { year: number; ticket_count: number; total_revenue: number }[]> = {};
    
    data.forEach((item: any) => {
      const date = new Date(item.month);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = [];
      }
      
      monthlyData[monthKey].push({
        year,
        ticket_count: item.ticket_count,
        total_revenue: item.total_revenue
      });
    });
    
    // Create year-over-year comparison data
    Object.keys(monthlyData).forEach(monthKey => {
      const entries = monthlyData[monthKey];
      if (entries.length >= 2) {
        // Sort by year descending to get current and previous year
        entries.sort((a, b) => b.year - a.year);
        
        const currentYearData = entries[0];
        const previousYearData = entries[1];
        
        // Calculate growth rates
        const ticketGrowthRate = previousYearData.ticket_count !== 0 
          ? parseFloat(((currentYearData.ticket_count - previousYearData.ticket_count) / previousYearData.ticket_count * 100).toFixed(2))
          : (currentYearData.ticket_count > 0 ? 100 : 0);
          
        const revenueGrowthRate = previousYearData.total_revenue !== 0
          ? parseFloat(((currentYearData.total_revenue - previousYearData.total_revenue) / previousYearData.total_revenue * 100).toFixed(2))
          : (currentYearData.total_revenue > 0 ? 100 : 0);
        
        processedData.push({
          month: monthKey,
          current_year_tickets: currentYearData.ticket_count,
          previous_year_tickets: previousYearData.ticket_count,
          current_year_revenue: currentYearData.total_revenue,
          previous_year_revenue: previousYearData.total_revenue,
          ticket_growth_rate: ticketGrowthRate,
          revenue_growth_rate: revenueGrowthRate
        });
      }
    });
    
    return processedData;
  },

  // Get forecasting data based on historical trends
  async getForecastData(monthsAhead: number = 6) {
    const supabase = getSupabaseBrowserClient();
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('monthly_ticket_trends')
      .select('*')
      .order('month', { ascending: true });
    
    if (error) throw error;
    
    // Process data for forecasting
    const processedData: ForecastData[] = [];
    
    if (data.length < 3) {
      // Not enough data for forecasting
      return processedData;
    }
    
    // Extract ticket counts and revenue for regression analysis
    const ticketCounts = data.map((item: any) => item.ticket_count);
    const revenues = data.map((item: any) => item.total_revenue);
    const months = data.map((item: any) => new Date(item.month).getMonth());
    
    // Calculate linear regression for tickets
    const ticketRegression = this.calculateRegression(months, ticketCounts);
    
    // Calculate linear regression for revenue
    const revenueRegression = this.calculateRegression(months, revenues);
    
    // Generate forecast for next months
    const lastMonth = new Date(data[data.length - 1].month);
    
    for (let i = 1; i <= monthsAhead; i++) {
      const nextMonth = new Date(lastMonth);
      nextMonth.setMonth(nextMonth.getMonth() + i);
      
      const monthIndex = nextMonth.getMonth();
      const predictedTickets = Math.max(0, Math.round(
        ticketRegression.slope * monthIndex + ticketRegression.intercept
      ));
      
      const predictedRevenue = Math.max(0, Math.round(
        revenueRegression.slope * monthIndex + revenueRegression.intercept
      ));
      
      // Calculate confidence interval (simplified)
      const avgTicketCount = ticketCounts.reduce((sum, count) => sum + count, 0) / ticketCounts.length;
      const ticketVariance = ticketCounts.reduce((sum, count) => sum + Math.pow(count - avgTicketCount, 2), 0) / ticketCounts.length;
      const ticketStdDev = Math.sqrt(ticketVariance);
      
      const confidenceLower = Math.max(0, predictedTickets - ticketStdDev);
      const confidenceUpper = predictedTickets + ticketStdDev;
      
      processedData.push({
        month: nextMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        predicted_tickets: predictedTickets,
        predicted_revenue: predictedRevenue,
        confidence_lower: Math.round(confidenceLower),
        confidence_upper: Math.round(confidenceUpper)
      });
    }
    
    return processedData;
  },

  // Helper function for linear regression calculation
  calculateRegression(x: number[], y: number[]): { slope: number, intercept: number } {
    if (x.length !== y.length || x.length < 2) return { slope: 0, intercept: 0 };
    
    const n = x.length;
    const sumX = x.reduce((sum, value) => sum + value, 0);
    const sumY = y.reduce((sum, value) => sum + value, 0);
    const sumXY = x.reduce((sum, value, i) => sum + value * y[i], 0);
    const sumXX = x.reduce((sum, value) => sum + value * value, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }
}