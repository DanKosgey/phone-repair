import { supabase } from './supabase';

export const dashboardService = {
  /**
   * Refresh all dashboard materialized views
   * This ensures the analytics data is up to date
   */
  async refreshMaterializedViews() {
    try {
      const { error } = await supabase.rpc('refresh_dashboard_materialized_views');
      if (error) throw error;
      console.log('Dashboard materialized views refreshed successfully');
      return { success: true };
    } catch (error) {
      console.error('Error refreshing dashboard materialized views:', error);
      return { success: false, error };
    }
  },

  /**
   * Get admin dashboard metrics from materialized view
   */
  async getAdminMetrics() {
    try {
      const { data, error } = await supabase
        .from('admin_dashboard_metrics')
        .select('*')
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
      return { success: false, error };
    }
  },

  /**
   * Get ticket trends data based on timeframe
   */
  async getTicketTrends(timeframe: string = 'daily') {
    try {
      let query = supabase.from('daily_ticket_trends').select('*');
      
      // For non-daily timeframes, we'll aggregate the data in the frontend
      if (timeframe === 'daily') {
        query = query.order('date', { ascending: true });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching ticket trends:', error);
      return { success: false, error };
    }
  },

  /**
   * Get ticket status distribution from materialized view
   */
  async getTicketStatusDistribution() {
    try {
      const { data, error } = await supabase
        .from('ticket_status_distribution')
        .select('*');
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching ticket status distribution:', error);
      return { success: false, error };
    }
  },

  /**
   * Get top products by sales from materialized view
   */
  async getTopProductsBySales(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('top_products_by_sales')
        .select('*')
        .order('total_revenue', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching top products by sales:', error);
      return { success: false, error };
    }
  },

  /**
   * Get inventory status from materialized view
   */
  async getInventoryStatus() {
    try {
      const { data, error } = await supabase
        .from('inventory_status')
        .select('*')
        .order('total_inventory_value', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching inventory status:', error);
      return { success: false, error };
    }
  },

  /**
   * Get customer lifetime value from materialized view
   */
  async getCustomerLifetimeValue(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('customer_lifetime_value')
        .select('*')
        .order('total_lifetime_value', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching customer lifetime value:', error);
      return { success: false, error };
    }
  }
};