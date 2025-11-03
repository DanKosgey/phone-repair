import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

// Define types for materialized views that may not be in the auto-generated types
interface DailyTicketTrends {
  date: string
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
  confidence_lower: number;
  confidence_upper: number;
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

  // Get daily revenue trends (default daily timeframe)
  async getDailyRevenueTrends(timeframe: Timeframe = 'daily') {
    const supabase = getSupabaseBrowserClient()
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('daily_ticket_trends')
      .select('*')
      .order('date', { ascending: true })
    
    if (error) throw error
    
    // Transform data based on selected timeframe
    switch (timeframe) {
      case 'weekly':
        return this.aggregateToWeekly(data as DailyTicketTrends[])
      case 'monthly':
        return this.aggregateToMonthly(data as DailyTicketTrends[])
      case 'quarterly':
        return this.aggregateToQuarterly(data as DailyTicketTrends[])
      case 'yearly':
        return this.aggregateToYearly(data as DailyTicketTrends[])
      default: // daily
        return data as DailyTicketTrends[]
    }
  },

  // Helper function to aggregate daily data to weekly
  aggregateToWeekly(data: DailyTicketTrends[]): any[] {
    const weeklyData: Record<string, any> = {}
    
    data.forEach(item => {
      const date = new Date(item.date)
      // Get the Monday of the week for grouping
      const monday = new Date(date)
      monday.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1))
      const weekKey = monday.toISOString().split('T')[0]
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          period: `Week of ${monday.toLocaleDateString()}`,
          ticket_count: 0,
          unique_customers: 0,
          total_revenue: 0
        }
      }
      
      weeklyData[weekKey].ticket_count += item.ticket_count
      weeklyData[weekKey].total_revenue += item.total_revenue
      // Note: unique_customers aggregation would need more complex logic in a real implementation
    })
    
    return Object.values(weeklyData)
  },

  // Helper function to aggregate daily data to monthly
  aggregateToMonthly(data: DailyTicketTrends[]): any[] {
    const monthlyData: Record<string, any> = {}
    
    data.forEach(item => {
      const date = new Date(item.date)
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          period: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          ticket_count: 0,
          unique_customers: 0,
          total_revenue: 0
        }
      }
      
      monthlyData[monthKey].ticket_count += item.ticket_count
      monthlyData[monthKey].total_revenue += item.total_revenue
    })
    
    return Object.values(monthlyData)
  },

  // Helper function to aggregate daily data to quarterly
  aggregateToQuarterly(data: DailyTicketTrends[]): any[] {
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
          unique_customers: 0,
          total_revenue: 0
        }
      }
      
      quarterlyData[quarterKey].ticket_count += item.ticket_count
      quarterlyData[quarterKey].total_revenue += item.total_revenue
    })
    
    return Object.values(quarterlyData)
  },

  // Helper function to aggregate daily data to yearly
  aggregateToYearly(data: DailyTicketTrends[]): any[] {
    const yearlyData: Record<string, any> = {}
    
    data.forEach(item => {
      const date = new Date(item.date)
      const yearKey = date.getFullYear().toString()
      
      if (!yearlyData[yearKey]) {
        yearlyData[yearKey] = {
          period: yearKey,
          ticket_count: 0,
          unique_customers: 0,
          total_revenue: 0
        }
      }
      
      yearlyData[yearKey].ticket_count += item.ticket_count
      yearlyData[yearKey].total_revenue += item.total_revenue
    })
    
    return Object.values(yearlyData)
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

  // Get customer lifetime value
  async getCustomerLifetimeValue() {
    const supabase = getSupabaseBrowserClient()
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('customer_lifetime_value')
      .select('*')
      .order('total_lifetime_value', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data as CustomerLifetimeValue[];
  },

  // Get period-over-period comparison data (replacing year-over-year)
  async getPeriodOverPeriodComparison(timeframe: Timeframe = 'daily') {
    const supabase = getSupabaseBrowserClient();
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('daily_ticket_trends')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Process data for period-over-period comparison
    const processedData: YearOverYearData[] = [];
    
    // Transform data based on selected timeframe
    let transformedData: any[] = [];
    switch (timeframe) {
      case 'weekly':
        transformedData = this.aggregateToWeekly(data as DailyTicketTrends[])
        break
      case 'monthly':
        transformedData = this.aggregateToMonthly(data as DailyTicketTrends[])
        break
      case 'quarterly':
        transformedData = this.aggregateToQuarterly(data as DailyTicketTrends[])
        break
      case 'yearly':
        transformedData = this.aggregateToYearly(data as DailyTicketTrends[])
        break
      default: // daily
        transformedData = data.map((item: any) => ({
          period: new Date(item.date).toLocaleDateString(),
          ticket_count: item.ticket_count,
          total_revenue: item.total_revenue
        }))
    }
    
    // For period-over-period comparison, we'll compare each period with the previous one
    for (let i = 1; i < transformedData.length; i++) {
      const currentPeriod = transformedData[i];
      const previousPeriod = transformedData[i - 1];
      
      // Calculate growth rates
      const ticketGrowthRate = previousPeriod.ticket_count !== 0 
        ? parseFloat(((currentPeriod.ticket_count - previousPeriod.ticket_count) / previousPeriod.ticket_count * 100).toFixed(2))
        : (currentPeriod.ticket_count > 0 ? 100 : 0);
        
      const revenueGrowthRate = previousPeriod.total_revenue !== 0
        ? parseFloat(((currentPeriod.total_revenue - previousPeriod.total_revenue) / previousPeriod.total_revenue * 100).toFixed(2))
        : (currentPeriod.total_revenue > 0 ? 100 : 0);
      
      // Calculate statistical significance of growth rates
      // Simple approach: if the absolute difference is greater than 2 standard deviations, consider it significant
      const ticketDiff = Math.abs(currentPeriod.ticket_count - previousPeriod.ticket_count);
      const avgTicketCount = (currentPeriod.ticket_count + previousPeriod.ticket_count) / 2;
      const ticketStdDev = Math.sqrt(avgTicketCount); // Poisson approximation for count data
      
      const revenueDiff = Math.abs(currentPeriod.total_revenue - previousPeriod.total_revenue);
      const avgRevenue = (currentPeriod.total_revenue + previousPeriod.total_revenue) / 2;
      const revenueStdDev = avgRevenue * 0.1; // Simplified assumption
      
      const ticketSignificant = ticketDiff > 2 * ticketStdDev;
      const revenueSignificant = revenueDiff > 2 * revenueStdDev;
      
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
      });
    }
    
    return processedData;
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

  // Get forecasting data based on historical trends with enhanced models
  async getForecastData(timeframe: Timeframe = 'daily', periodsAhead: number = 6) {
    const supabase = getSupabaseBrowserClient();
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('daily_ticket_trends')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Transform data based on selected timeframe
    let transformedData: any[] = [];
    switch (timeframe) {
      case 'weekly':
        transformedData = this.aggregateToWeekly(data as DailyTicketTrends[])
        break
      case 'monthly':
        transformedData = this.aggregateToMonthly(data as DailyTicketTrends[])
        break
      case 'quarterly':
        transformedData = this.aggregateToQuarterly(data as DailyTicketTrends[])
        break
      case 'yearly':
        transformedData = this.aggregateToYearly(data as DailyTicketTrends[])
        break
      default: // daily
        transformedData = data.map((item: any) => ({
          period: new Date(item.date).toLocaleDateString(),
          ticket_count: item.ticket_count,
          total_revenue: item.total_revenue
        }))
    }
    
    // Process data for forecasting
    const processedData: ForecastData[] = [];
    
    if (transformedData.length < 3) {
      // Not enough data for forecasting
      return processedData;
    }
    
    // Extract ticket counts and revenue for regression analysis
    const ticketCounts = transformedData.map((item: any) => item.ticket_count);
    const revenues = transformedData.map((item: any) => item.total_revenue);
    const periods = transformedData.map((item: any, index: number) => index + 1); // 1-indexed periods
    
    // Calculate different regression models for tickets
    const linearModel = this.calculateLinearRegression(periods, ticketCounts);
    const polynomialModel = this.calculatePolynomialRegression(periods, ticketCounts);
    const logarithmicModel = this.calculateLogarithmicRegression(periods, ticketCounts);
    
    // Select best model based on R-squared
    const models = [
      { name: 'linear', rSquared: linearModel.rSquared },
      { name: 'polynomial', rSquared: polynomialModel.rSquared },
      { name: 'logarithmic', rSquared: logarithmicModel.rSquared }
    ];
    
    const bestModel = models.reduce((best, current) => 
      current.rSquared > best.rSquared ? current : best
    );
    
    // Generate forecast using the best model
    const lastPeriod = periods[periods.length - 1];
    
    for (let i = 1; i <= periodsAhead; i++) {
      const forecastPeriod = lastPeriod + i;
      let predictedTickets = 0;
      
      switch (bestModel.name) {
        case 'linear':
          predictedTickets = Math.max(0, Math.round(
            linearModel.slope * forecastPeriod + linearModel.intercept
          ));
          break;
        case 'polynomial':
          const [a, b, c] = polynomialModel.coefficients;
          predictedTickets = Math.max(0, Math.round(
            a * forecastPeriod * forecastPeriod + b * forecastPeriod + c
          ));
          break;
        case 'logarithmic':
          predictedTickets = Math.max(0, Math.round(
            logarithmicModel.a * Math.log(forecastPeriod) + logarithmicModel.b
          ));
          break;
        default:
          // Fallback to linear
          predictedTickets = Math.max(0, Math.round(
            linearModel.slope * forecastPeriod + linearModel.intercept
          ));
      }
      
      // Simple linear regression for revenue (keeping it simple for now)
      const revenueRegression = this.calculateRegression(periods, revenues);
      const predictedRevenue = Math.max(0, Math.round(
        revenueRegression.slope * forecastPeriod + revenueRegression.intercept
      ));
      
      // Calculate confidence interval (simplified)
      const avgTicketCount = ticketCounts.reduce((sum, count) => sum + count, 0) / ticketCounts.length;
      const ticketVariance = ticketCounts.reduce((sum, count) => sum + Math.pow(count - avgTicketCount, 2), 0) / ticketCounts.length;
      const ticketStdDev = Math.sqrt(ticketVariance);
      
      const confidenceLower = Math.max(0, predictedTickets - ticketStdDev);
      const confidenceUpper = predictedTickets + ticketStdDev;
      
      processedData.push({
        period: `Period ${i} after ${transformedData[transformedData.length - 1].period}`,
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

  // Enhanced linear regression with statistical significance
  calculateEnhancedLinearRegression(x: number[], y: number[]): { 
    slope: number, 
    intercept: number, 
    rSquared: number, 
    slopePValue: number, 
    interceptPValue: number,
    slopeConfidenceInterval: [number, number],
    interceptConfidenceInterval: [number, number]
  } {
    if (x.length !== y.length || x.length < 3) {
      return { 
        slope: 0, 
        intercept: 0, 
        rSquared: 0, 
        slopePValue: 1, 
        interceptPValue: 1,
        slopeConfidenceInterval: [0, 0],
        interceptConfidenceInterval: [0, 0]
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
    
    return { 
      slope, 
      intercept, 
      rSquared, 
      slopePValue, 
      interceptPValue,
      slopeConfidenceInterval,
      interceptConfidenceInterval
    };
  },

  // Enhanced correlation with statistical significance
  calculateEnhancedCorrelation(x: number[], y: number[]): { 
    correlation: number, 
    pValue: number, 
    confidenceInterval: [number, number] 
  } {
    if (x.length !== y.length || x.length < 3) {
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
    if (Math.abs(correlation) === 1 || n <= 2) {
      return { correlation, pValue: correlation === 1 ? 0 : 1, confidenceInterval: [correlation, correlation] };
    }
    
    const df = n - 2;
    const t = Math.abs(correlation) * Math.sqrt(df / (1 - Math.pow(correlation, 2)));
    const pValue = 2 * (1 - this.cumulativeNormalDistribution(t));
    
    // Calculate confidence interval using Fisher transformation
    const fisherZ = 0.5 * Math.log((1 + correlation) / (1 - correlation));
    const se = 1 / Math.sqrt(n - 3);
    const zCritical = 1.96; // 95% CI
    
    const zLower = fisherZ - zCritical * se;
    const zUpper = fisherZ + zCritical * se;
    
    const lower = (Math.exp(2 * zLower) - 1) / (Math.exp(2 * zLower) + 1);
    const upper = (Math.exp(2 * zUpper) - 1) / (Math.exp(2 * zUpper) + 1);
    
    const confidenceInterval: [number, number] = [lower, upper];
    
    return { correlation, pValue, confidenceInterval };
  },

  // Advanced forecasting methods
  // Simple exponential smoothing (Holt-Winters single parameter)
  calculateExponentialSmoothing(data: number[], alpha: number = 0.3): number[] {
    if (data.length === 0) return [];
    
    const smoothed: number[] = [data[0]]; // First value is the initial forecast
    
    for (let i = 1; i < data.length; i++) {
      const forecast = alpha * data[i - 1] + (1 - alpha) * smoothed[i - 1];
      smoothed.push(forecast);
    }
    
    return smoothed;
  },

  // Double exponential smoothing (Holt's method) for trend
  calculateDoubleExponentialSmoothing(data: number[], alpha: number = 0.3, beta: number = 0.3): { 
    level: number[], 
    trend: number[], 
    forecast: number[] 
  } {
    if (data.length < 2) {
      return { level: data, trend: Array(data.length).fill(0), forecast: data };
    }
    
    const level: number[] = [data[0]];
    const trend: number[] = [data[1] - data[0]];
    const forecast: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      const currentLevel = alpha * data[i] + (1 - alpha) * (level[i - 1] + trend[i - 1]);
      const currentTrend = beta * (currentLevel - level[i - 1]) + (1 - beta) * trend[i - 1];
      
      level.push(currentLevel);
      trend.push(currentTrend);
      
      // Forecast for next period
      const nextForecast = currentLevel + currentTrend;
      forecast.push(nextForecast);
    }
    
    return { level, trend, forecast };
  },

  // Simple ARIMA(0,1,1) model (equivalent to exponential smoothing)
  calculateARIMA011(data: number[], theta: number = 0.3): number[] {
    if (data.length < 2) return [...data];
    
    // First difference the data
    const diffData: number[] = [];
    for (let i = 1; i < data.length; i++) {
      diffData.push(data[i] - data[i - 1]);
    }
    
    // Apply MA(1) model to differenced data
    const forecasts: number[] = [data[0]]; // Initial forecast
    
    for (let i = 0; i < diffData.length; i++) {
      // ARIMA(0,1,1) forecast: forecast[t+1] = data[t] + (1 - theta) * error[t]
      const error = i > 0 ? diffData[i - 1] - (forecasts[i] - data[i]) : 0;
      const forecast = data[i] + theta * error;
      forecasts.push(forecast);
    }
    
    return forecasts;
  },

  // Advanced forecasting with multiple methods
  async getAdvancedForecastData(timeframe: Timeframe = 'daily', periodsAhead: number = 6) {
    const supabase = getSupabaseBrowserClient();
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('daily_ticket_trends')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Transform data based on selected timeframe
    let transformedData: any[] = [];
    switch (timeframe) {
      case 'weekly':
        transformedData = this.aggregateToWeekly(data as DailyTicketTrends[])
        break
      case 'monthly':
        transformedData = this.aggregateToMonthly(data as DailyTicketTrends[])
        break
      case 'quarterly':
        transformedData = this.aggregateToQuarterly(data as DailyTicketTrends[])
        break
      case 'yearly':
        transformedData = this.aggregateToYearly(data as DailyTicketTrends[])
        break
      default: // daily
        transformedData = data.map((item: any) => ({
          period: new Date(item.date).toLocaleDateString(),
          ticket_count: item.ticket_count,
          total_revenue: item.total_revenue
        }))
    }
    
    // Process data for advanced forecasting
    const processedData: any[] = [];
    
    if (transformedData.length < 3) {
      // Not enough data for advanced forecasting
      return processedData;
    }
    
    // Extract ticket counts for forecasting
    const ticketCounts = transformedData.map((item: any) => item.ticket_count);
    
    // Apply different forecasting methods
    const exponentialSmooth = this.calculateExponentialSmoothing(ticketCounts, 0.3);
    const doubleExponential = this.calculateDoubleExponentialSmoothing(ticketCounts, 0.3, 0.3);
    const arimaForecast = this.calculateARIMA011(ticketCounts, 0.3);
    
    // Generate forecasts for future periods
    const lastValue = ticketCounts[ticketCounts.length - 1];
    const lastTrend = doubleExponential.trend[doubleExponential.trend.length - 1];
    
    // Create forecasts for future periods
    const forecasts: any[] = [];
    for (let i = 1; i <= periodsAhead; i++) {
      const periodIndex = transformedData.length + i - 1;
      const periodLabel = `Period ${i} after ${transformedData[transformedData.length - 1].period}`;
      
      // Exponential smoothing forecast (use last smoothed value)
      const expForecast = exponentialSmooth[exponentialSmooth.length - 1];
      
      // Double exponential smoothing forecast (level + i * trend)
      const holtForecast = doubleExponential.level[doubleExponential.level.length - 1] + 
                          i * doubleExponential.trend[doubleExponential.trend.length - 1];
      
      // ARIMA forecast (use last forecasted value)
      const arimaValue = arimaForecast[arimaForecast.length - 1];
      
      // Ensemble forecast (average of all methods)
      const ensembleForecast = (expForecast + holtForecast + arimaValue) / 3;
      
      forecasts.push({
        period: periodLabel,
        exponential_smoothing: Math.max(0, Math.round(expForecast)),
        holt_winters: Math.max(0, Math.round(holtForecast)),
        arima: Math.max(0, Math.round(arimaValue)),
        ensemble: Math.max(0, Math.round(ensembleForecast))
      });
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
    };
  },

  // Outlier detection methods
  // Z-score method for outlier detection
  detectOutliersZScore(data: number[], threshold: number = 3): { 
    outliers: number[], 
    indices: number[], 
    zScores: number[] 
  } {
    if (data.length === 0) {
      return { outliers: [], indices: [], zScores: [] };
    }
    
    // Calculate mean and standard deviation
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate z-scores and identify outliers
    const outliers: number[] = [];
    const indices: number[] = [];
    const zScores: number[] = [];
    
    data.forEach((value, index) => {
      const zScore = stdDev !== 0 ? Math.abs((value - mean) / stdDev) : 0;
      zScores.push(zScore);
      
      if (zScore > threshold) {
        outliers.push(value);
        indices.push(index);
      }
    });
    
    return { outliers, indices, zScores };
  },

  // Interquartile Range (IQR) method for outlier detection
  detectOutliersIQR(data: number[]): { 
    outliers: number[], 
    indices: number[], 
    q1: number, 
    q3: number, 
    iqr: number 
  } {
    if (data.length === 0) {
      return { outliers: [], indices: [], q1: 0, q3: 0, iqr: 0 };
    }
    
    // Sort data for quartile calculation
    const sortedData = [...data].sort((a, b) => a - b);
    
    // Calculate quartiles
    const q1Index = Math.floor(sortedData.length * 0.25);
    const q3Index = Math.floor(sortedData.length * 0.75);
    const q1 = sortedData[q1Index];
    const q3 = sortedData[q3Index];
    const iqr = q3 - q1;
    
    // Calculate outlier bounds
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // Identify outliers
    const outliers: number[] = [];
    const indices: number[] = [];
    
    data.forEach((value, index) => {
      if (value < lowerBound || value > upperBound) {
        outliers.push(value);
        indices.push(index);
      }
    });
    
    return { outliers, indices, q1, q3, iqr };
  },

  // Modified Z-score method using median absolute deviation (MAD)
  detectOutliersModifiedZScore(data: number[], threshold: number = 3.5): { 
    outliers: number[], 
    indices: number[], 
    modifiedZScores: number[] 
  } {
    if (data.length === 0) {
      return { outliers: [], indices: [], modifiedZScores: [] };
    }
    
    // Calculate median
    const sortedData = [...data].sort((a, b) => a - b);
    const median = sortedData[Math.floor(sortedData.length / 2)];
    
    // Calculate median absolute deviation (MAD)
    const deviations = data.map(value => Math.abs(value - median));
    const mad = deviations.sort((a, b) => a - b)[Math.floor(deviations.length / 2)];
    
    // Calculate modified z-scores
    const outliers: number[] = [];
    const indices: number[] = [];
    const modifiedZScores: number[] = [];
    
    data.forEach((value, index) => {
      const modifiedZScore = mad !== 0 ? 0.6745 * (value - median) / mad : 0;
      modifiedZScores.push(modifiedZScore);
      
      if (Math.abs(modifiedZScore) > threshold) {
        outliers.push(value);
        indices.push(index);
      }
    });
    
    return { outliers, indices, modifiedZScores };
  },

  // Tukey's fences method
  detectOutliersTukey(data: number[], k: number = 1.5): { 
    outliers: number[], 
    indices: number[], 
    lowerFence: number, 
    upperFence: number 
  } {
    if (data.length === 0) {
      return { outliers: [], indices: [], lowerFence: 0, upperFence: 0 };
    }
    
    // Calculate quartiles using more precise method
    const sortedData = [...data].sort((a, b) => a - b);
    const q1 = this.getQuantile(sortedData, 0.25);
    const q3 = this.getQuantile(sortedData, 0.75);
    const iqr = q3 - q1;
    
    // Calculate fences
    const lowerFence = q1 - k * iqr;
    const upperFence = q3 + k * iqr;
    
    // Identify outliers
    const outliers: number[] = [];
    const indices: number[] = [];
    
    data.forEach((value, index) => {
      if (value < lowerFence || value > upperFence) {
        outliers.push(value);
        indices.push(index);
      }
    });
    
    return { outliers, indices, lowerFence, upperFence };
  },

  // Helper function to calculate quantiles
  getQuantile(sortedData: number[], quantile: number): number {
    const index = quantile * (sortedData.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    
    if (lowerIndex === upperIndex) {
      return sortedData[lowerIndex];
    }
    
    const weight = index - lowerIndex;
    return sortedData[lowerIndex] * (1 - weight) + sortedData[upperIndex] * weight;
  },

  // Outlier detection for ticket data
  async getTicketDataWithOutlierDetection(timeframe: Timeframe = 'daily') {
    const supabase = getSupabaseBrowserClient();
    // Using RPC to query materialized views as they're not in the auto-generated types
    const { data, error } = await (supabase as any)
      .from('daily_ticket_trends')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    
    // Transform data based on selected timeframe
    let transformedData: any[] = [];
    switch (timeframe) {
      case 'weekly':
        transformedData = this.aggregateToWeekly(data as DailyTicketTrends[])
        break
      case 'monthly':
        transformedData = this.aggregateToMonthly(data as DailyTicketTrends[])
        break
      case 'quarterly':
        transformedData = this.aggregateToQuarterly(data as DailyTicketTrends[])
        break
      case 'yearly':
        transformedData = this.aggregateToYearly(data as DailyTicketTrends[])
        break
      default: // daily
        transformedData = data.map((item: any) => ({
          period: new Date(item.date).toLocaleDateString(),
          ticket_count: item.ticket_count,
          unique_customers: item.unique_customers,
          total_revenue: item.total_revenue
        }))
    }
    
    if (transformedData.length === 0) {
      return { data: [], outliers: { zScore: [], iqr: [], modifiedZScore: [], tukey: [] } };
    }
    
    // Extract ticket counts for outlier detection
    const ticketCounts = transformedData.map((item: any) => item.ticket_count);
    
    // Apply different outlier detection methods
    const zScoreOutliers = this.detectOutliersZScore(ticketCounts);
    const iqrOutliers = this.detectOutliersIQR(ticketCounts);
    const modifiedZScoreOutliers = this.detectOutliersModifiedZScore(ticketCounts);
    const tukeyOutliers = this.detectOutliersTukey(ticketCounts);
    
    // Enhance data with outlier information
    const enhancedData = transformedData.map((item: any, index: number) => ({
      ...item,
      isZScoreOutlier: zScoreOutliers.indices.includes(index),
      isIQROutlier: iqrOutliers.indices.includes(index),
      isModifiedZScoreOutlier: modifiedZScoreOutliers.indices.includes(index),
      isTukeyOutlier: tukeyOutliers.indices.includes(index),
      zScore: zScoreOutliers.zScores[index] || 0,
      modifiedZScore: modifiedZScoreOutliers.modifiedZScores[index] || 0
    }));
    
    return {
      data: enhancedData,
      outliers: {
        zScore: zScoreOutliers,
        iqr: iqrOutliers,
        modifiedZScore: modifiedZScoreOutliers,
        tukey: tukeyOutliers
      }
    };
  }
}