import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

// Define types for materialized views that may not be in the auto-generated types
interface TrendsData {
  period: string;
  ticket_count: number;
  unique_customers: number;
  total_revenue: number;
  average_ticket_value: number;
  revenue_per_customer: number;
}

interface DailyTicketTrends {
  date: string;
  ticket_count: number;
  unique_customers: number;
  total_revenue: number;
}

// Create a type for the actual data structure we get from the materialized view
interface DailyTicketTrendsView {
  date: string;
  ticket_count: number;
  unique_customers: number;
  total_revenue: number;
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
  period: string;
  current_period_tickets: number;
  previous_period_tickets: number;
  current_period_revenue: number;
  previous_period_revenue: number;
  ticket_growth_rate: number;
  revenue_growth_rate: number;
  ticket_significant?: boolean;
  revenue_significant?: boolean;
}

interface ForecastData {
  period: string;
  predicted_tickets: number;
  predicted_revenue: number;
  ticket_confidence_lower: number;
  ticket_confidence_upper: number;
  revenue_confidence_lower: number;
  revenue_confidence_upper: number;
}

interface CustomerLifetimeValue {
  id: string;
  name: string | null;
  email: string | null;
  total_tickets: number;
  total_orders: number;
  repair_revenue: number;
  product_revenue: number;
  total_lifetime_value: number;
  last_activity: string | null;
}

// Timeframe enum for configurable timeframes
export type Timeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export const dashboardDb = {
  // Helper function to format period based on timeframe
  formatPeriod(date: Date, timeframe: Timeframe): string {
    switch (timeframe) {
      case 'daily':
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      case 'weekly': {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);
        return `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'quarterly': {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      }
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  },

  // Get admin dashboard metrics
  async getAdminMetrics() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('admin_dashboard_metrics')
        .select('*')
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching admin metrics:', error)
      throw error
    }
  },

  // Get revenue trends with proper aggregation for the selected timeframe
  async getRevenueTrends(timeframe: Timeframe = 'daily', startDate?: string, endDate?: string) {
    try {
      const supabase = getSupabaseBrowserClient()

      // For direct query, we need to handle dates properly
      let query = supabase
        .from('tickets')
        .select(`
          created_at,
          id,
          user_id,
          final_cost
        `)
        .order('created_at', { ascending: true });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: rawData, error: queryError } = await query;
      
      if (queryError) throw queryError;

      // Process raw data into time periods manually
      const processedData: Record<string, any> = {};
      
      rawData.forEach((item: any) => {
        const date = new Date(item.created_at);
        let periodKey: string;
        let periodLabel: string;
        
        switch (timeframe) {
          case 'weekly': {
            // Get Monday of the week
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date);
            monday.setDate(diff);
            periodKey = monday.toISOString().split('T')[0];
            periodLabel = `Week of ${monday.toLocaleDateString()}`;
            break;
          }
          case 'monthly':
            periodKey = `${date.getFullYear()}-${date.getMonth()}`;
            periodLabel = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            break;
          case 'quarterly': {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            periodKey = `${date.getFullYear()}-Q${quarter}`;
            periodLabel = `Q${quarter} ${date.getFullYear()}`;
            break;
          }
          case 'yearly':
            periodKey = date.getFullYear().toString();
            periodLabel = date.getFullYear().toString();
            break;
          default: // daily
            periodKey = date.toISOString().split('T')[0];
            periodLabel = date.toLocaleDateString();
        }
        
        if (!processedData[periodKey]) {
          processedData[periodKey] = {
            period: periodLabel,
            ticket_count: 0,
            unique_customers: new Set(),
            total_revenue: 0
          };
        }
        
        processedData[periodKey].ticket_count += 1;
        processedData[periodKey].unique_customers.add(item.user_id);
        processedData[periodKey].total_revenue += item.final_cost || 0;
      });
      
      // Convert Set to count for unique customers
      Object.values(processedData).forEach((item: any) => {
        item.unique_customers = item.unique_customers.size;
      });
      
      // Format the data
      const formattedData: TrendsData[] = Object.values(processedData).map((item: any) => {
        const ticketCount = item.ticket_count || 0;
        const uniqueCustomers = item.unique_customers || 0;
        const totalRevenue = item.total_revenue || 0;
        return {
          period: item.period,
          ticket_count: ticketCount,
          unique_customers: uniqueCustomers,
          total_revenue: totalRevenue,
          average_ticket_value: ticketCount > 0 ? totalRevenue / ticketCount : 0,
          revenue_per_customer: uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0
        };
      });
      
      // Sort by period
      return formattedData.sort((a, b) => {
        // Simple string comparison for sorting
        return a.period.localeCompare(b.period);
      });
    } catch (error) {
      console.error('Error fetching revenue trends:', error)
      throw error
    }
  },

  // Get revenue trends for paid tickets only
  async getRevenueTrendsPaidOnly(timeframe: Timeframe = 'daily', startDate?: string, endDate?: string) {
    try {
      const supabase = getSupabaseBrowserClient()

      // Query only paid tickets
      let query = supabase
        .from('tickets')
        .select(`
          created_at,
          id,
          user_id,
          final_cost
        `)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: rawData, error: queryError } = await query;
      
      if (queryError) throw queryError;

      // Process raw data into time periods manually
      const processedData: Record<string, any> = {};
      
      rawData.forEach((item: any) => {
        const date = new Date(item.created_at);
        let periodKey: string;
        let periodLabel: string;
        
        switch (timeframe) {
          case 'weekly': {
            // Get Monday of the week
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            const monday = new Date(date);
            monday.setDate(diff);
            periodKey = monday.toISOString().split('T')[0];
            periodLabel = `Week of ${monday.toLocaleDateString()}`;
            break;
          }
          case 'monthly':
            periodKey = `${date.getFullYear()}-${date.getMonth()}`;
            periodLabel = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            break;
          case 'quarterly': {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            periodKey = `${date.getFullYear()}-Q${quarter}`;
            periodLabel = `Q${quarter} ${date.getFullYear()}`;
            break;
          }
          case 'yearly':
            periodKey = date.getFullYear().toString();
            periodLabel = date.getFullYear().toString();
            break;
          default: // daily
            periodKey = date.toISOString().split('T')[0];
            periodLabel = date.toLocaleDateString();
        }
        
        if (!processedData[periodKey]) {
          processedData[periodKey] = {
            period: periodLabel,
            ticket_count: 0,
            unique_customers: new Set(),
            total_revenue: 0
          };
        }
        
        processedData[periodKey].ticket_count += 1;
        processedData[periodKey].unique_customers.add(item.user_id);
        processedData[periodKey].total_revenue += item.final_cost || 0;
      });
      
      // Convert Set to count for unique customers
      Object.values(processedData).forEach((item: any) => {
        item.unique_customers = item.unique_customers.size;
      });
      
      // Format the data
      const formattedData: TrendsData[] = Object.values(processedData).map((item: any) => {
        const ticketCount = item.ticket_count || 0;
        const uniqueCustomers = item.unique_customers || 0;
        const totalRevenue = item.total_revenue || 0;
        return {
          period: item.period,
          ticket_count: ticketCount,
          unique_customers: uniqueCustomers,
          total_revenue: totalRevenue,
          average_ticket_value: ticketCount > 0 ? totalRevenue / ticketCount : 0,
          revenue_per_customer: uniqueCustomers > 0 ? totalRevenue / uniqueCustomers : 0
        };
      });
      
      // Sort by period
      return formattedData.sort((a, b) => {
        // Simple string comparison for sorting
        return a.period.localeCompare(b.period);
      });
    } catch (error) {
      console.error('Error fetching paid revenue trends:', error)
      throw error
    }
  },

  // Helper function to aggregate daily data to weekly
  aggregateToWeekly(data: any[]): any[] {
    // Add empty data validation
    if (!data || data.length === 0) {
      return []
    }
    
    const weeklyData: Record<string, any> = {}
    
    data.forEach(item => {
      const date = new Date(item.date)
      // Get the Monday of the week for grouping using UTC to avoid timezone issues
      const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
      const day = monday.getUTCDay()
      const diff = monday.getUTCDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      monday.setUTCDate(diff)
      
      // Format the date as YYYY-MM-DD for consistent grouping
      const weekKey = monday.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          period: `Week of ${monday.toLocaleDateString(undefined, { timeZone: 'UTC' })}`,
          ticket_count: 0,
          unique_customers: 0, // Initialize as number
          total_revenue: 0
        }
      }
      
      weeklyData[weekKey].ticket_count += item.ticket_count
      weeklyData[weekKey].total_revenue += item.total_revenue
      weeklyData[weekKey].unique_customers += item.unique_customers
    })
    
    return Object.values(weeklyData)
  },

  // Helper function to aggregate daily data to monthly
  aggregateToMonthly(data: any[]): any[] {
    // Add empty data validation
    if (!data || data.length === 0) {
      return []
    }
    
    const monthlyData: Record<string, any> = {}
    
    data.forEach(item => {
      const date = new Date(item.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          period: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          ticket_count: 0,
          unique_customers: 0, // Initialize as number
          total_revenue: 0
        }
      }
      
      monthlyData[monthKey].ticket_count += item.ticket_count
      monthlyData[monthKey].total_revenue += item.total_revenue
      monthlyData[monthKey].unique_customers += item.unique_customers
    })
    
    return Object.values(monthlyData)
  },

  // Helper function to aggregate daily data to quarterly
  aggregateToQuarterly(data: any[]): any[] {
    // Add empty data validation
    if (!data || data.length === 0) {
      return []
    }
    
    const quarterlyData: Record<string, any> = {}
    
    data.forEach(item => {
      const date = new Date(item.date)
      const quarter = Math.floor(date.getMonth() / 3) + 1
      const year = date.getFullYear()
      const quarterKey = `${year}-Q${quarter}`
      
      if (!quarterlyData[quarterKey]) {
        quarterlyData[quarterKey] = {
          period: `Q${quarter} ${year}`,
          ticket_count: 0,
          unique_customers: 0, // Initialize as number
          total_revenue: 0
        }
      }
      
      quarterlyData[quarterKey].ticket_count += item.ticket_count
      quarterlyData[quarterKey].total_revenue += item.total_revenue
      quarterlyData[quarterKey].unique_customers += item.unique_customers
    })
    
    return Object.values(quarterlyData)
  },

  // Helper function to aggregate daily data to yearly
  aggregateToYearly(data: any[]): any[] {
    // Add empty data validation
    if (!data || data.length === 0) {
      return []
    }
    
    const yearlyData: Record<string, any> = {}
    
    data.forEach(item => {
      const date = new Date(item.date)
      const yearKey = date.getFullYear().toString()
      
      if (!yearlyData[yearKey]) {
        yearlyData[yearKey] = {
          period: yearKey,
          ticket_count: 0,
          unique_customers: 0, // Initialize as number
          total_revenue: 0
        }
      }
      
      yearlyData[yearKey].ticket_count += item.ticket_count
      yearlyData[yearKey].total_revenue += item.total_revenue
      yearlyData[yearKey].unique_customers += item.unique_customers
    })
    
    return Object.values(yearlyData)
  },

  // Get ticket status distribution
  async getTicketStatusDistribution() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('ticket_status_distribution')
        .select('*')
      
      if (error) throw error
      return data as TicketStatusDistribution[]
    } catch (error) {
      console.error('Error fetching ticket status distribution:', error)
      throw error
    }
  },

  // Get top products by sales
  async getTopProductsBySales() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('top_products_by_sales')
        .select('*')
        .order('total_revenue', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data as TopProductsBySales[]
    } catch (error) {
      console.error('Error fetching top products by sales:', error)
      throw error
    }
  },

  // Get inventory status
  async getInventoryStatus() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('inventory_status')
        .select('*')
        .order('total_inventory_value', { ascending: false })
      
      if (error) throw error
      return data as InventoryStatus[]
    } catch (error) {
      console.error('Error fetching inventory status:', error)
      throw error
    }
  },

  // Get customer lifetime value
  async getCustomerLifetimeValue() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('customer_lifetime_value')
        .select('*')
        .order('total_lifetime_value', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data as CustomerLifetimeValue[]
    } catch (error) {
      console.error('Error fetching customer lifetime value:', error)
      throw error
    }
  },

  // Get period-over-period comparison data (replacing year-over-year)
  async getPeriodOverPeriodComparison(timeframe: Timeframe = 'daily') {
    try {
      const supabase = getSupabaseBrowserClient() as any
      const { data, error } = await supabase
        .rpc('get_daily_ticket_trends')
      
      if (error) throw error
      
      // Process data for period-over-period comparison
      const processedData: YearOverYearData[] = []
      
      // Transform data based on selected timeframe
      let transformedData: any[] = []
      switch (timeframe) {
        case 'weekly':
          transformedData = this.aggregateToWeekly(data)
          break
        case 'monthly':
          transformedData = this.aggregateToMonthly(data)
          break
        case 'quarterly':
          transformedData = this.aggregateToQuarterly(data)
          break
        case 'yearly':
          transformedData = this.aggregateToYearly(data)
          break
        default: // daily
          transformedData = (data as any[]).map((item: any) => ({
            period: new Date(item.date).toLocaleDateString(),
            ticket_count: item.ticket_count,
            total_revenue: item.total_revenue
          }))
      }
      
      // For period-over-period comparison, we'll compare each period with the previous one
      for (let i = 1; i < transformedData.length; i++) {
        const currentPeriod = transformedData[i]
        const previousPeriod = transformedData[i - 1]
        
        // Calculate growth rates
        const ticketGrowthRate = previousPeriod.ticket_count !== 0 
          ? parseFloat(((currentPeriod.ticket_count - previousPeriod.ticket_count) / previousPeriod.ticket_count * 100).toFixed(2))
          : (currentPeriod.ticket_count > 0 ? 100 : 0)
          
        const revenueGrowthRate = previousPeriod.total_revenue !== 0
          ? parseFloat(((currentPeriod.total_revenue - previousPeriod.total_revenue) / previousPeriod.total_revenue * 100).toFixed(2))
          : (currentPeriod.total_revenue > 0 ? 100 : 0)
        
        // Calculate statistical significance of growth rates
        // Simple approach: if the absolute difference is greater than 2 standard deviations, consider it significant
        const ticketDiff = Math.abs(currentPeriod.ticket_count - previousPeriod.ticket_count)
        const avgTicketCount = (currentPeriod.ticket_count + previousPeriod.ticket_count) / 2
        const ticketStdDev = Math.sqrt(avgTicketCount) // Poisson approximation for count data
        
        const revenueDiff = Math.abs(currentPeriod.total_revenue - previousPeriod.total_revenue)
        const avgRevenue = (currentPeriod.total_revenue + previousPeriod.total_revenue) / 2
        const revenueStdDev = avgRevenue * 0.1 // Simplified assumption
        
        const ticketSignificant = ticketDiff > 2 * ticketStdDev
        const revenueSignificant = revenueDiff > 2 * revenueStdDev
        
        processedData.push({
          period: currentPeriod.period,
          current_period_tickets: currentPeriod.ticket_count,
          previous_period_tickets: previousPeriod.ticket_count,
          current_period_revenue: currentPeriod.total_revenue,
          previous_period_revenue: previousPeriod.total_revenue,
          ticket_growth_rate: ticketGrowthRate,
          revenue_growth_rate: revenueGrowthRate,
          ticket_significant: ticketSignificant,
          revenue_significant: revenueSignificant
        })
      }
      
      return processedData
    } catch (error) {
      console.error('Error fetching period-over-period comparison data:', error)
      throw error
    }
  },

  // Get forecasting data based on historical trends with enhanced models
  async getForecastData(timeframe: Timeframe = 'daily', periodsAhead: number = 6) {
    try {
      const data = await this.getRevenueTrends(timeframe);
      
      // Process data for forecasting
      const processedData: ForecastData[] = []
      
      if (data.length < 3) {
        // Not enough data for forecasting
        return processedData
      }
      
      // Extract ticket counts and revenue for regression analysis
      const ticketCounts = data.map((item: any) => item.ticket_count)
      const revenues = data.map((item: any) => item.total_revenue)
      const periods = data.map((item: any, index: number) => index + 1) // 1-indexed periods
      
      // Calculate different regression models for tickets
      const linearModel = this.calculateEnhancedLinearRegression(periods, ticketCounts)
      const polynomialModel = this.calculatePolynomialRegression(periods, ticketCounts)
      const logarithmicModel = this.calculateLogarithmicRegression(periods, ticketCounts)
      
      // Select best model based on R-squared
      const models = [
        { name: 'linear', rSquared: linearModel.rSquared, model: linearModel },
        { name: 'polynomial', rSquared: polynomialModel.rSquared, model: polynomialModel },
        { name: 'logarithmic', rSquared: logarithmicModel.rSquared, model: logarithmicModel }
      ]
      
      const best = models.reduce((best, current) => 
        current.rSquared > best.rSquared ? current : best
      )
      
      // Calculate revenue model (always linear)
      const revenueModel = this.calculateEnhancedLinearRegression(periods, revenues)
      
      // Calculate simple stddev for non-linear models
      const avgTicketCount = ticketCounts.reduce((sum, count) => sum + count, 0) / ticketCounts.length
      const ticketVariance = ticketCounts.reduce((sum, count) => sum + Math.pow(count - avgTicketCount, 2), 0) / ticketCounts.length
      const ticketStdDev = Math.sqrt(ticketVariance)
      
      // Get last date for forecasting periods
      const lastDate = new Date(data[data.length - 1].period)
      const lastPeriodIndex = periods[periods.length - 1]
      
      for (let i = 1; i <= periodsAhead; i++) {
        const forecastPeriodIndex = lastPeriodIndex + i
        let predictedTickets = 0
        
        let ticketLower = 0
        let ticketUpper = 0
        
        switch (best.name) {
          case 'linear':
            predictedTickets = Math.max(0, Math.round(
              linearModel.slope * forecastPeriodIndex + linearModel.intercept
            ))
            const sePredTicket = Math.sqrt(linearModel.mse * (1 + 1 / periods.length + Math.pow(forecastPeriodIndex - linearModel.meanX, 2) / linearModel.ssxx))
            const marginTicket = linearModel.tValue * sePredTicket
            ticketLower = Math.max(0, Math.round(predictedTickets - marginTicket))
            ticketUpper = Math.round(predictedTickets + marginTicket)
            break
          case 'polynomial':
            const [a, b, c] = polynomialModel.coefficients
            predictedTickets = Math.max(0, Math.round(
              a * forecastPeriodIndex * forecastPeriodIndex + b * forecastPeriodIndex + c
            ))
            ticketLower = Math.max(0, predictedTickets - ticketStdDev)
            ticketUpper = predictedTickets + ticketStdDev
            break
          case 'logarithmic':
            predictedTickets = Math.max(0, Math.round(
              logarithmicModel.a * Math.log(forecastPeriodIndex) + logarithmicModel.b
            ))
            ticketLower = Math.max(0, predictedTickets - ticketStdDev)
            ticketUpper = predictedTickets + ticketStdDev
            break
        }
        
        const predictedRevenue = Math.max(0, Math.round(
          revenueModel.slope * forecastPeriodIndex + revenueModel.intercept
        ))
        
        const sePredRevenue = Math.sqrt(revenueModel.mse * (1 + 1 / periods.length + Math.pow(forecastPeriodIndex - revenueModel.meanX, 2) / revenueModel.ssxx))
        const marginRevenue = revenueModel.tValue * sePredRevenue
        const revenueLower = Math.max(0, Math.round(predictedRevenue - marginRevenue))
        const revenueUpper = Math.round(predictedRevenue + marginRevenue)
        
        // Calculate forecast date
        const forecastDate = new Date(lastDate)
        switch (timeframe) {
          case 'daily':
            forecastDate.setDate(forecastDate.getDate() + i)
            break
          case 'weekly':
            forecastDate.setDate(forecastDate.getDate() + 7 * i)
            break
          case 'monthly':
            forecastDate.setMonth(forecastDate.getMonth() + i)
            break
          case 'quarterly':
            forecastDate.setMonth(forecastDate.getMonth() + 3 * i)
            break
          case 'yearly':
            forecastDate.setFullYear(forecastDate.getFullYear() + i)
            break
        }
        
        const formattedPeriod = this.formatPeriod(forecastDate, timeframe)
        
        processedData.push({
          period: formattedPeriod,
          predicted_tickets: predictedTickets,
          predicted_revenue: predictedRevenue,
          ticket_confidence_lower: ticketLower,
          ticket_confidence_upper: ticketUpper,
          revenue_confidence_lower: revenueLower,
          revenue_confidence_upper: revenueUpper
        })
      }
      
      return processedData
    } catch (error) {
      console.error('Error fetching forecast data:', error)
      throw error
    }
  },

  // Advanced forecasting with multiple methods
  async getAdvancedForecastData(timeframe: Timeframe = 'daily', periodsAhead: number = 6) {
    try {
      const supabase = getSupabaseBrowserClient() as any
      const { data, error } = await supabase
        .rpc('get_daily_ticket_trends')
      
      if (error) throw error
      
      // Transform data based on selected timeframe
      let transformedData: any[] = []
      switch (timeframe) {
        case 'weekly':
          transformedData = this.aggregateToWeekly(data)
          break
        case 'monthly':
          transformedData = this.aggregateToMonthly(data)
          break
        case 'quarterly':
          transformedData = this.aggregateToQuarterly(data)
          break
        case 'yearly':
          transformedData = this.aggregateToYearly(data)
          break
        default: // daily
          transformedData = data.map((item: any) => ({
            period: new Date(item.date).toLocaleDateString(),
            ticket_count: item.ticket_count,
            total_revenue: item.total_revenue
          }))
      }
      
      // Process data for advanced forecasting
      const processedData: any[] = []
      
      if (transformedData.length < 3) {
        // Not enough data for advanced forecasting
        return processedData
      }
      
      // Extract ticket counts for forecasting
      const ticketCounts = transformedData.map((item: any) => item.ticket_count)
      
      // Apply different forecasting methods
      const exponentialSmooth = this.calculateExponentialSmoothing(ticketCounts, 0.3)
      const doubleExponential = this.calculateDoubleExponentialSmoothing(ticketCounts, 0.3, 0.3)
      const arimaForecast = this.calculateARIMA011(ticketCounts, 0.3)
      
      // Generate forecasts for future periods
      const lastValue = ticketCounts[ticketCounts.length - 1]
      const lastTrend = doubleExponential.trend[doubleExponential.trend.length - 1]
      
      // Create forecasts for future periods
      const forecasts: any[] = []
      for (let i = 1; i <= periodsAhead; i++) {
        const periodIndex = transformedData.length + i - 1
        const periodLabel = `Period ${i} after ${transformedData[transformedData.length - 1].period}`
        
        // Exponential smoothing forecast (use last smoothed value)
        const expForecast = exponentialSmooth[exponentialSmooth.length - 1]
        
        // Double exponential smoothing forecast (level + i * trend)
        const holtForecast = doubleExponential.level[doubleExponential.level.length - 1] + 
                            i * doubleExponential.trend[doubleExponential.trend.length - 1]
        
        // ARIMA forecast (use last forecasted value)
        const arimaValue = arimaForecast[arimaForecast.length - 1]
        
        // Ensemble forecast (average of all methods)
        const ensembleForecast = (expForecast + holtForecast + arimaValue) / 3
        
        forecasts.push({
          period: periodLabel,
          exponential_smoothing: Math.max(0, Math.round(expForecast)),
          holt_winters: Math.max(0, Math.round(holtForecast)),
          arima: Math.max(0, Math.round(arimaValue)),
          ensemble: Math.max(0, Math.round(ensembleForecast))
        })
      }
      
      return {
        historical_data: transformedData.map((item, index) => ({
          ...item,
          exponential_smoothed: exponentialSmooth[index],
          holt_winters_level: doubleExponential.level[index],
          holt_winters_trend: doubleExponential.trend[index],
          arima_forecast: arimaForecast[index]
        })),
        forecasts: forecasts
      }
    } catch (error) {
      console.error('Error fetching advanced forecast data:', error)
      throw error
    }
  },

  // Simple Exponential Smoothing
  calculateExponentialSmoothing(data: number[], alpha: number): number[] {
    if (data.length === 0) return [];
    const smoothed: number[] = [data[0]];
    for (let i = 1; i < data.length; i++) {
      smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
    }
    return smoothed;
  },

  // Double Exponential Smoothing (Holt's Linear Trend)
  calculateDoubleExponentialSmoothing(data: number[], alpha: number, beta: number): { level: number[]; trend: number[] } {
    if (data.length < 2) return { level: [], trend: [] };
    let level = data[0];
    let trend = data[1] - data[0];
    const levels: number[] = [level];
    const trends: number[] = [trend];
    for (let i = 1; i < data.length; i++) {
      const prevLevel = level;
      level = alpha * data[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
      levels.push(level);
      trends.push(trend);
    }
    return { level: levels, trend: trends };
  },

  // ARIMA(0,1,1) Implementation
  calculateARIMA011(data: number[], theta: number): number[] {
    if (data.length === 0) return [];
    const fitted: number[] = [data[0]];
    let e = 0;
    for (let i = 1; i < data.length; i++) {
      const pred = fitted[i - 1] + theta * e;
      e = data[i] - pred;
      fitted.push(pred);
    }
    return fitted;
  },

  // Enhanced regression analysis functions
  // Linear regression
  calculateLinearRegression(x: number[], y: number[]): { slope: number, intercept: number, rSquared: number } {
    if (x.length !== y.length || x.length < 2) return { slope: 0, intercept: 0, rSquared: 0 };
    
    const n = x.length;
    const sumX = x.reduce((sum, value) => sum + value, 0);
    const sumY = y.reduce((sum, value) => sum + value, 0);
    const sumXY = x.reduce((sum, value, i) => sum + value * y[i], 0);
    const sumXX = x.reduce((sum, value) => sum + value * value, 0);
    const sumYY = y.reduce((sum, value) => sum + value * value, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = sumYY - n * yMean * yMean;
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    return { slope, intercept, rSquared };
  },

  // Polynomial regression (quadratic)
  calculatePolynomialRegression(x: number[], y: number[]): { coefficients: number[], rSquared: number } {
    if (x.length !== y.length || x.length < 3) return { coefficients: [0, 0, 0], rSquared: 0 };
    
    // For quadratic regression: y = a*x^2 + b*x + c
    // We solve the system of normal equations
    
    const n = x.length;
    let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
    let sumY = 0, sumXY = 0, sumX2Y = 0;
    
    for (let i = 0; i < n; i++) {
      const xi = x[i];
      const yi = y[i];
      const xi2 = xi * xi;
      
      sumX += xi;
      sumX2 += xi2;
      sumX3 += xi2 * xi;
      sumX4 += xi2 * xi2;
      sumY += yi;
      sumXY += xi * yi;
      sumX2Y += xi2 * yi;
    }
    
    // Solve the system:
    // [n    sumX   sumX2] [c]   [sumY ]
    // [sumX sumX2  sumX3] [b] = [sumXY]
    // [sumX2 sumX3 sumX4] [a]   [sumX2Y]
    
    const det = n * (sumX2 * sumX4 - sumX3 * sumX3) - 
                sumX * (sumX * sumX4 - sumX3 * sumX2) + 
                sumX2 * (sumX * sumX3 - sumX2 * sumX2);
    
    if (Math.abs(det) < 1e-10) {
      return { coefficients: [0, 0, 0], rSquared: 0 };
    }
    
    const a = (sumY * (sumX2 * sumX4 - sumX3 * sumX3) - 
               sumX * (sumXY * sumX4 - sumX3 * sumX2Y) + 
               sumX2 * (sumXY * sumX3 - sumX2 * sumX2Y)) / det;
    
    const b = (n * (sumXY * sumX4 - sumX3 * sumX2Y) - 
               sumY * (sumX * sumX4 - sumX3 * sumX2) + 
               sumX2 * (sumX * sumX2Y - sumXY * sumX2)) / det;
    
    const c = (n * (sumX2 * sumX2Y - sumXY * sumX3) - 
               sumX * (sumX * sumX2Y - sumXY * sumX2) + 
               sumY * (sumX * sumX3 - sumX2 * sumX2)) / det;
    
    // Calculate R-squared
    const yMean = sumY / n;
    let totalSumSquares = 0;
    let residualSumSquares = 0;
    
    for (let i = 0; i < n; i++) {
      const xi = x[i];
      const yi = y[i];
      const predicted = a * xi * xi + b * xi + c;
      totalSumSquares += Math.pow(yi - yMean, 2);
      residualSumSquares += Math.pow(yi - predicted, 2);
    }
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    return { coefficients: [a, b, c], rSquared };
  },

  // Logarithmic regression (y = a*ln(x) + b)
  calculateLogarithmicRegression(x: number[], y: number[]): { a: number, b: number, rSquared: number } {
    if (x.length !== y.length || x.length < 2) return { a: 0, b: 0, rSquared: 0 };
    
    // Check if all x values are positive (required for logarithm)
    if (x.some(xi => xi <= 0)) return { a: 0, b: 0, rSquared: 0 };
    
    // Transform x to ln(x)
    const lnX = x.map(xi => Math.log(xi));
    
    // Apply linear regression to (lnX, y)
    const result = this.calculateLinearRegression(lnX, y);
    
    return { a: result.slope, b: result.intercept, rSquared: result.rSquared };
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
  },

  // Statistical significance testing functions
  // Calculate t-statistic p-value for regression slope
  calculateRegressionPValue(slope: number, standardError: number, degreesOfFreedom: number): number {
    if (standardError === 0 || degreesOfFreedom <= 0) return 1;
    
    const tStatistic = Math.abs(slope) / standardError;
    return this.calculateTTestPValue(tStatistic, degreesOfFreedom);
  },

  // Calculate p-value for t-test
  calculateTTestPValue(tStatistic: number, degreesOfFreedom: number): number {
    if (degreesOfFreedom <= 0) return 1;
    
    // For large degrees of freedom, use normal approximation
    if (degreesOfFreedom > 30) {
      return 2 * (1 - this.cumulativeNormalDistribution(Math.abs(tStatistic)));
    }
    
    // For small degrees of freedom, use t-distribution approximation
    return this.approximateTPValue(tStatistic, degreesOfFreedom);
  },

  // Approximate t-distribution p-value
  approximateTPValue(t: number, df: number): number {
    // Simple approximation for t-distribution p-value
    // This is a simplified version - in practice, you'd use more accurate methods
    const x = df / (df + t * t);
    const a = 0.5;
    const b = 0.5 * df;
    const beta = this.incompleteBeta(a, b, x);
    return 1 - beta;
  },

  // Incomplete beta function (simplified approximation)
  incompleteBeta(a: number, b: number, x: number): number {
    if (x < 0 || x > 1) return 0;
    if (x === 0 || x === 1) return x;
    
    // Continued fraction approximation
    const lbeta = this.logBeta(a, b);
    const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta) / a;
    
    let f = 1;
    let c = 1;
    let d = 0;
    
    for (let i = 0; i <= 200; i++) {
      const m = Math.floor(i / 2);
      let numerator;
      
      if (i === 0) {
        numerator = 1;
      } else if (i % 2 === 0) {
        numerator = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
      } else {
        numerator = -((a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
      }
      
      // Update c and d
      c = 1 + numerator / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      
      d = 1 + numerator * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      
      d = 1 / d;
      const delta = c * d;
      f *= delta;
      
      if (Math.abs(delta - 1) < 1e-15) break;
    }
    
    return front * f;
  },

  // Log beta function
  logBeta(a: number, b: number): number {
    return this.logGamma(a) + this.logGamma(b) - this.logGamma(a + b);
  },

  // Log gamma function (Stirling's approximation)
  logGamma(x: number): number {
    if (x <= 0) return Infinity;
    if (x === 1 || x === 2) return 0;
    
    const cof = [
      76.18009172947146, -86.50532032941677, 24.01409824083091,
      -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5
    ];
    
    let y = x;
    let tmp = x + 5.5;
    tmp = (x + 0.5) * Math.log(tmp) - tmp;
    let ser = 1.000000000190015;
    
    for (let j = 0; j <= 5; j++) {
      ser += cof[j] / ++y;
    }
    
    return tmp + Math.log(2.5066282746310005 * ser / x);
  },

  // Cumulative normal distribution
  cumulativeNormalDistribution(x: number): number {
    // Approximation using Abramowitz and Stegun formula
    const a1 = 0.31938153;
    const a2 = -0.356563782;
    const a3 = 1.781477937;
    const a4 = -1.821255978;
    const a5 = 1.330274429;
    
    const p = 0.2316419;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * absX);
    const polynomial = a1 + t * (a2 + t * (a3 + t * (a4 + t * a5)));
    const y = 1.0 - (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * absX * absX) * t * polynomial;
    
    return sign === 1 ? y : 1 - y;
  },

  // Enhanced linear regression with statistical significance and additional stats for prediction intervals
  calculateEnhancedLinearRegression(x: number[], y: number[]): { 
    slope: number, 
    intercept: number, 
    rSquared: number, 
    slopePValue: number, 
    interceptPValue: number,
    slopeConfidenceInterval: [number, number],
    interceptConfidenceInterval: [number, number],
    mse: number,
    meanX: number,
    ssxx: number,
    tValue: number
  } {
    if (x.length !== y.length || x.length < 3) {
      return { 
        slope: 0, 
        intercept: 0, 
        rSquared: 0, 
        slopePValue: 1, 
        interceptPValue: 1,
        slopeConfidenceInterval: [0, 0],
        interceptConfidenceInterval: [0, 0],
        mse: 0,
        meanX: 0,
        ssxx: 0,
        tValue: 0
      };
    }
    
    const n = x.length;
    const sumX = x.reduce((sum, value) => sum + value, 0);
    const sumY = y.reduce((sum, value) => sum + value, 0);
    const sumXY = x.reduce((sum, value, i) => sum + value * y[i], 0);
    const sumXX = x.reduce((sum, value) => sum + value * value, 0);
    const sumYY = y.reduce((sum, value) => sum + value * value, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = sumYY - n * yMean * yMean;
    const residualSumSquares = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    // Calculate standard errors
    const mse = residualSumSquares / (n - 2); // Mean squared error
    const seSlope = Math.sqrt(mse / (sumXX - sumX * sumX / n));
    const seIntercept = Math.sqrt(mse * sumXX / (n * (sumXX - sumX * sumX / n)));
    
    // Calculate p-values
    const df = n - 2;
    const slopePValue = this.calculateTTestPValue(Math.abs(slope) / seSlope, df);
    const interceptPValue = this.calculateTTestPValue(Math.abs(intercept) / seIntercept, df);
    
    // Calculate 95% confidence intervals (t-value for 95% CI with n-2 df)
    // For simplicity, using approximate t-value of 2 for large samples
    const tValue = df > 30 ? 1.96 : 2.0; // Approximate 95% CI t-value
    const slopeMargin = tValue * seSlope;
    const interceptMargin = tValue * seIntercept;
    
    const slopeConfidenceInterval: [number, number] = [slope - slopeMargin, slope + slopeMargin];
    const interceptConfidenceInterval: [number, number] = [intercept - interceptMargin, intercept + interceptMargin];
    
    const meanX = sumX / n;
    const ssxx = sumXX - (sumX * sumX / n);
    
    return { 
      slope, 
      intercept, 
      rSquared, 
      slopePValue, 
      interceptPValue,
      slopeConfidenceInterval,
      interceptConfidenceInterval,
      mse,
      meanX,
      ssxx,
      tValue
    };
  },

  // Get ticket summary
  async getTicketSummary() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('ticket_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching ticket summary:', error)
      throw error
    }
  },

  // Get customer summary
  async getCustomerSummary() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('customer_summary')
        .select('*')
        .order('last_activity', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching customer summary:', error)
      throw error
    }
  },

  // Get product sales summary
  async getProductSalesSummary() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('product_sales_summary')
        .select('*')
        .order('total_revenue', { ascending: false })
        .limit(10)
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching product sales summary:', error)
      throw error
    }
  },

  // Enhanced correlation analysis with statistical significance testing and confidence intervals
  calculateEnhancedCorrelation(x: number[], y: number[]): { 
    correlation: number, 
    pValue: number,
    confidenceInterval: [number, number]
  } {
    if (x.length !== y.length || x.length < 2) {
      return { correlation: 0, pValue: 1, confidenceInterval: [0, 0] };
    }
    
    const n = x.length;
    
    // Calculate means
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = y.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate correlation coefficient
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      denomX += Math.pow(xDiff, 2);
      denomY += Math.pow(yDiff, 2);
    }
    
    const denominator = Math.sqrt(denomX * denomY);
    const correlation = denominator !== 0 ? numerator / denominator : 0;
    
    // Calculate p-value using t-distribution
    // t = r * sqrt((n-2)/(1-r^2))
    const df = n - 2;
    let pValue = 1;
    
    if (df > 0 && Math.abs(correlation) < 1) {
      const tStatistic = correlation * Math.sqrt(df / (1 - correlation * correlation));
      pValue = this.calculateTTestPValue(Math.abs(tStatistic), df);
    }
    
    // Calculate confidence interval using Fisher transformation
    // For small samples, we use approximate method
    let confidenceInterval: [number, number] = [correlation, correlation];
    
    if (n > 3) {
      // Fisher z-transformation
      const z = 0.5 * Math.log((1 + correlation) / (1 - correlation));
      const zSigma = 1 / Math.sqrt(n - 3);
      
      // 95% confidence interval
      const zLower = z - 1.96 * zSigma;
      const zUpper = z + 1.96 * zSigma;
      
      // Transform back to correlation scale
      const lower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1);
      const upper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1);
      
      confidenceInterval = [lower, upper];
    }
    
    return { correlation, pValue, confidenceInterval };
  }
}