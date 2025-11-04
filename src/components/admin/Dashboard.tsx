"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Package, 
  Users, 
  Calendar, 
  Clock, 
  Eye, 
  Wrench, 
  ShoppingCart, 
  Plus, 
  AlertCircle 
} from "lucide-react"
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         AreaChart, Area, ScatterChart, Scatter } from 'recharts'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import { dashboardDb, Timeframe } from '@/lib/db/dashboard'
import { ticketsDb } from '@/lib/db/tickets'
import { productsDb } from '@/lib/db/products'
import { customersDb } from '@/lib/db/customers'

// Types
type StatCard = {
  title: string
  value: string
  change: string
  icon: any
  color: string
}

type TicketData = {
  name: string
  ticket_count: number
  unique_customers: number
  total_revenue: number
  moving_average?: number
}

type TicketStatusData = {
  status: string
  count: number
}

type TopProduct = {
  name: string
  total_revenue: number
  total_quantity_sold: number
}

type CustomerLifetimeValue = {
  name: string
  email: string
  total_tickets: number
  total_lifetime_value: number
}

type PeriodOverPeriodData = {
  period: string
  current_period_tickets: number
  previous_period_tickets: number
  current_period_revenue: number
  previous_period_revenue: number
  ticket_growth_rate: number
  revenue_growth_rate: number
  ticket_significant?: boolean
  revenue_significant?: boolean
}

type ForecastData = {
  period: string
  predicted_tickets: number
  predicted_revenue: number
  ticket_confidence_lower: number
  ticket_confidence_upper: number
  revenue_confidence_lower: number
  revenue_confidence_upper: number
}

type RecentTicket = {
  id: string
  ticket_number: string
  status: string
  customer_name: string
  device_brand: string
  device_model: string
  created_at: string
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function AdminDashboard() {
  const { user, role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  // State
  const [timeframe, setTimeframe] = useState<Timeframe>(() => {
    if (typeof window !== 'undefined') {
      const savedTimeframe = localStorage.getItem('dashboardTimeframe');
      if (savedTimeframe && ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(savedTimeframe)) {
        return savedTimeframe as Timeframe;
      }
    }
    return 'daily';
  });

  const [stats, setStats] = useState<StatCard[]>([
    { title: "Total Revenue", value: "KSh 0", change: "+0% from last month", icon: Package, color: "bg-blue-500" },
    { title: "Tickets", value: "0", change: "+0% from last month", icon: BarChart3, color: "bg-green-500" },
    { title: "Customers", value: "0", change: "+0% from last month", icon: Users, color: "bg-orange-500" },
  ])
  
  const [ticketData, setTicketData] = useState<TicketData[]>([])
  const [ticketStatusData, setTicketStatusData] = useState<TicketStatusData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [customerLifetimeValue, setCustomerLifetimeValue] = useState<CustomerLifetimeValue[]>([])
  const [periodOverPeriodData, setPeriodOverPeriodData] = useState<PeriodOverPeriodData[]>([])
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  
  // Statistical analysis data
  const [ticketMovingAverage, setTicketMovingAverage] = useState<number[]>([])
  const [ticketTrendDirection, setTicketTrendDirection] = useState<'up' | 'down' | 'stable'>('stable')
  const [ticketVolatility, setTicketVolatility] = useState<string>('0')
  const [ticketVariance, setTicketVariance] = useState<string>('0');
  const [ticketCoefficientOfVariation, setTicketCoefficientOfVariation] = useState<string>('0');
  const [ticketRollingVolatility, setTicketRollingVolatility] = useState<number[]>([]);
  const [ticketRevenueCorrelation, setTicketRevenueCorrelation] = useState<string>('0')
  const [ticketRevenueCorrelationPValue, setTicketRevenueCorrelationPValue] = useState<string>('0');
  const [ticketRevenueCorrelationSignificant, setTicketRevenueCorrelationSignificant] = useState<boolean>(false);
  const [ticketRegression, setTicketRegression] = useState<{slope: number, intercept: number}>({slope: 0, intercept: 0})
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState({
    stats: true,
    charts: true,
    tickets: true
  })

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        redirect('/login')
      }
    }
  }, [user, role, authLoading])

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [timeframe])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch stats
      await fetchStats()
      
      // Fetch chart data
      await fetchChartData()
      
      // Fetch recent tickets
      await fetchRecentTickets()
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setDataLoading(prev => ({ ...prev, stats: true }))
      const data = await dashboardDb.getAdminMetrics()
      
      // Calculate total revenue from repair and product revenue
      const totalRevenue = (data.total_repair_revenue || 0) + (data.total_product_revenue || 0)
      
      setStats([
        { 
          title: "Total Revenue", 
          value: `KSh ${totalRevenue.toLocaleString()}`, 
          change: "+0% from last month", 
          icon: Package, 
          color: "bg-blue-500" 
        },
        { 
          title: "Tickets", 
          value: (data.tickets_completed || 0).toString(), 
          change: "+0% from last month", 
          icon: BarChart3, 
          color: "bg-green-500" 
        },
        { 
          title: "Customers", 
          value: (data.total_customers || 0).toString(), 
          change: "+0% from last month", 
          icon: Users, 
          color: "bg-orange-500" 
        },
      ])
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      })
    } finally {
      setDataLoading(prev => ({ ...prev, stats: false }))
    }
  }

  // Enhanced statistical functions
  const calculateSimpleMovingAverage = (data: number[], period: number = 3): number[] => {
    if (data.length === 0) return [];
    
    const sma: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        // For initial points, use available data
        const slice = data.slice(0, i + 1);
        const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
        sma.push(average);
      } else {
        // For other points, use full period window
        const slice = data.slice(i - period + 1, i + 1);
        const average = slice.reduce((sum, val) => sum + val, 0) / period;
        sma.push(average);
      }
    }
    
    return sma;
  };

  const calculateWeightedMovingAverage = (data: number[], weights: number[]): number[] => {
    const wma: number[] = [];
    const weightSum = weights.reduce((sum, w) => sum + w, 0);
    
    for (let i = weights.length - 1; i < data.length; i++) {
      let weightedSum = 0;
      for (let j = 0; j < weights.length; j++) {
        weightedSum += data[i - j] * weights[j];
      }
      wma.push(weightedSum / weightSum);
    }
    
    // Fill in the beginning with simple averages
    for (let i = 0; i < weights.length - 1; i++) {
      wma.unshift(data.slice(0, i + 1).reduce((sum, val) => sum + val, 0) / (i + 1));
    }
    
    return wma;
  };

  const calculateExponentialMovingAverage = (data: number[], smoothingFactor: number = 0.3): number[] => {
    if (data.length === 0) return [];
    
    const ema: number[] = [data[0]]; // First EMA is the first data point
    
    for (let i = 1; i < data.length; i++) {
      const newValue = data[i] * smoothingFactor + ema[i - 1] * (1 - smoothingFactor);
      ema.push(newValue);
    }
    
    return ema;
  };

  // Enhanced exponential smoothing with different methods
  const calculateEnhancedExponentialSmoothing = (data: number[], alpha: number = 0.3): number[] => {
    if (data.length === 0) return [];
    
    // Use the database implementation for more accurate calculations
    return dashboardDb.calculateExponentialSmoothing(data, alpha);
  };

  // Double exponential smoothing (Holt's linear trend method)
  const calculateDoubleExponentialSmoothing = (data: number[], alpha: number = 0.3, beta: number = 0.3): { level: number[], trend: number[] } => {
    if (data.length === 0) return { level: [], trend: [] };
    
    // Use the database implementation for more accurate calculations
    return dashboardDb.calculateDoubleExponentialSmoothing(data, alpha, beta);
  };

  // Triple exponential smoothing (Holt-Winters seasonal method)
  const calculateTripleExponentialSmoothing = (data: number[], alpha: number = 0.3, beta: number = 0.3, gamma: number = 0.3, seasonality: number = 4): { level: number[], trend: number[], seasonal: number[], forecast: number[] } => {
    if (data.length === 0) return { level: [], trend: [], seasonal: [], forecast: [] };
    
    // For simplicity, we'll implement a basic version here
    // In practice, you might want to use the database implementation
    
    // Initialize components
    const level: number[] = Array(data.length).fill(0);
    const trend: number[] = Array(data.length).fill(0);
    const seasonal: number[] = Array(data.length).fill(0);
    const forecast: number[] = [];
    
    // Initial estimates
    if (data.length >= seasonality * 2) {
      // Calculate initial level and trend from first two seasons
      let sum1 = 0, sum2 = 0;
      for (let i = 0; i < seasonality; i++) {
        sum1 += data[i];
        sum2 += data[i + seasonality];
      }
      
      level[seasonality - 1] = sum1 / seasonality;
      trend[seasonality - 1] = (sum2 - sum1) / (seasonality * seasonality);
      
      // Calculate initial seasonal indices
      for (let i = 0; i < seasonality; i++) {
        seasonal[i] = data[i] / level[seasonality - 1];
      }
      
      // Calculate forecasts
      for (let i = seasonality; i < data.length; i++) {
        // Update level
        level[i] = alpha * (data[i] / seasonal[i - seasonality]) + (1 - alpha) * (level[i - 1] + trend[i - 1]);
        
        // Update trend
        trend[i] = beta * (level[i] - level[i - 1]) + (1 - beta) * trend[i - 1];
        
        // Update seasonal
        seasonal[i] = gamma * (data[i] / level[i]) + (1 - gamma) * seasonal[i - seasonality];
        
        // Forecast next period
        const nextForecast = (level[i] + trend[i]) * seasonal[i - seasonality + 1];
        forecast.push(nextForecast);
      }
    }
    
    return { level, trend, seasonal, forecast };
  };

  // Adaptive moving average (KAMA - Kaufman's Adaptive Moving Average)
  const calculateKAMA = (data: number[], period: number = 10, fastSC: number = 2, slowSC: number = 30): number[] => {
    if (data.length === 0) return [];
    
    const kama: number[] = [data[0]];
    let volatilitySum = 0;
    
    // Calculate initial volatility
    for (let i = 1; i < Math.min(period + 1, data.length); i++) {
      volatilitySum += Math.abs(data[i] - data[i - 1]);
    }
    
    const fastAlpha = 2 / (fastSC + 1);
    const slowAlpha = 2 / (slowSC + 1);
    
    for (let i = 1; i < data.length; i++) {
      // Calculate efficiency ratio (ER)
      const change = Math.abs(data[i] - (i >= period ? data[i - period] : data[0]));
      let volatility = 0;
      
      // Calculate volatility for the period
      const start = Math.max(1, i - period + 1);
      for (let j = start; j <= i; j++) {
        volatility += Math.abs(data[j] - data[j - 1]);
      }
      
      // Avoid division by zero
      const er = volatility !== 0 ? change / volatility : 1;
      
      // Calculate smoothing constant
      const sc = Math.pow(er * (fastAlpha - slowAlpha) + slowAlpha, 2);
      
      // Calculate KAMA
      const newValue = kama[i - 1] + sc * (data[i] - kama[i - 1]);
      kama.push(newValue);
    }
    
    return kama;
  };

  // Hull Moving Average (HMA)
  const calculateHullMA = (data: number[], period: number = 9): number[] => {
    if (data.length === 0) return [];
    
    // HMA = WMA(2*WMA(n/2) - WMA(n)), sqrt(n)
    const sqrtPeriod = Math.round(Math.sqrt(period));
    
    // Calculate weights for WMA
    const createWeights = (n: number): number[] => {
      return Array.from({ length: n }, (_, i) => i + 1);
    };
    
    const wmaHalf = calculateWeightedMovingAverage(data, createWeights(Math.floor(period / 2)));
    const wmaFull = calculateWeightedMovingAverage(data, createWeights(period));
    
    // Calculate 2*WMA(n/2) - WMA(n)
    const diff: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const val = 2 * (wmaHalf[i] || 0) - (wmaFull[i] || 0);
      diff.push(val);
    }
    
    // Apply WMA with sqrt period to the difference
    const hma = calculateWeightedMovingAverage(diff, createWeights(sqrtPeriod));
    
    return hma;
  };

  // Triangular Moving Average (TMA)
  const calculateTriangularMA = (data: number[], period: number = 10): number[] => {
    if (data.length === 0) return [];
    
    // TMA is a double smoothed SMA
    const sma1 = calculateSimpleMovingAverage(data, Math.ceil((period + 1) / 2));
    const sma2 = calculateSimpleMovingAverage(sma1, Math.floor((period + 1) / 2));
    
    return sma2;
  };

  const fetchChartData = async () => {
    try {
      setDataLoading(prev => ({ ...prev, charts: true }));
      
      // Fetch real data from database with selected timeframe
      const [ticketTrendData, statusData, topProducts, customerData, periodOverPeriod, forecast] = await Promise.all([
        dashboardDb.getRevenueTrends(timeframe),
        dashboardDb.getTicketStatusDistribution(),
        dashboardDb.getTopProductsBySales(),
        dashboardDb.getCustomerLifetimeValue(),
        dashboardDb.getPeriodOverPeriodComparison(timeframe),
        dashboardDb.getForecastData(timeframe)
      ]);
      
      // Transform ticket trend data for charts
      const transformedTicketData = ticketTrendData.map((item: any) => ({
        name: item.period || item.date || item.month,
        ticket_count: item.ticket_count,
        unique_customers: item.unique_customers,
        total_revenue: item.total_revenue
      }));
      
      // Transform status data
      const transformedStatusData = statusData.map(item => ({
        status: item.status,
        count: item.count
      }));
      
      // Transform top products data
      const transformedTopProducts = topProducts.map(item => ({
        name: item.name,
        total_revenue: item.total_revenue,
        total_quantity_sold: item.total_quantity_sold
      }));
      
      // Transform customer data
      const transformedCustomerData = customerData.map(item => ({
        name: item.name || 'Unknown',
        email: item.email || '',
        total_tickets: item.total_tickets,
        total_lifetime_value: item.total_lifetime_value
      }));
      
      setTicketData(transformedTicketData);
      setTicketStatusData(transformedStatusData);
      setTopProducts(transformedTopProducts);
      setCustomerLifetimeValue(transformedCustomerData);
      setPeriodOverPeriodData(periodOverPeriod);
      setForecastData(forecast);
      
      // Calculate enhanced moving averages
      const ticketCounts = transformedTicketData.map(item => item.ticket_count);
      
      // Simple moving average (3-period window)
      const simpleMovingAvg = calculateSimpleMovingAverage(ticketCounts, 3);
      
      // Weighted moving average (3-period with weights [1, 2, 3])
      const weightedMovingAvg = calculateWeightedMovingAverage(ticketCounts, [1, 2, 3]);
      
      // Exponential moving average
      const exponentialMovingAvg = calculateExponentialMovingAverage(ticketCounts, 0.3);
      
      // Enhanced exponential smoothing
      const enhancedExponentialSmooth = calculateEnhancedExponentialSmoothing(ticketCounts, 0.3);
      
      // Double exponential smoothing (Holt's method)
      const doubleExponentialSmooth = calculateDoubleExponentialSmoothing(ticketCounts, 0.3, 0.3);
      
      // Adaptive moving average (KAMA)
      const kama = calculateKAMA(ticketCounts, 10);
      
      // Hull moving average
      const hullMA = calculateHullMA(ticketCounts, 9);
      
      // Triangular moving average
      const triangularMA = calculateTriangularMA(ticketCounts, 10);
      
      // Combine all moving averages for the chart
      const enhancedTicketData = transformedTicketData.map((item, index) => ({
        ...item,
        simple_moving_average: simpleMovingAvg[index] || 0,
        weighted_moving_average: weightedMovingAvg[index] || 0,
        exponential_moving_average: exponentialMovingAvg[index] || 0,
        enhanced_exponential: enhancedExponentialSmooth[index] || 0,
        double_exponential_level: doubleExponentialSmooth.level[index] || 0,
        double_exponential_trend: doubleExponentialSmooth.trend[index] || 0,
        kama: kama[index] || 0,
        hull_ma: hullMA[index] || 0,
        triangular_ma: triangularMA[index] || 0
      }));
      
      setTicketData(enhancedTicketData);
      setTicketMovingAverage(simpleMovingAvg);
      
      // Calculate trend direction using enhanced linear regression with statistical significance
      const calculateEnhancedTrendDirection = (data: { ticket_count: number }[]): 'up' | 'down' | 'stable' => {
        if (data.length < 3) return 'stable'; // Need at least 3 points for meaningful regression
        
        // Prepare data for linear regression (x: index, y: ticket_count)
        const xValues = data.map((_, index) => index);
        const yValues = data.map(item => item.ticket_count);
        
        // Use enhanced linear regression with statistical significance testing
        const regressionResult = dashboardDb.calculateEnhancedLinearRegression(xValues, yValues);
        
        // Check if trend is statistically significant (p-value < 0.05)
        const isSignificant = regressionResult.slopePValue < 0.05;
        
        // Determine trend based on slope and statistical significance
        if (!isSignificant || Math.abs(regressionResult.slope) < 0.01) {
          return 'stable'; // Not statistically significant or nearly flat trend
        }
        
        return regressionResult.slope > 0 ? 'up' : 'down';
      };
      
      // Calculate trend direction
      const trendDirection = calculateEnhancedTrendDirection(transformedTicketData);
      setTicketTrendDirection(trendDirection);
      
      // Enhanced volatility calculations with additional statistical measures
      const ticketCountsForVolatility = transformedTicketData.map(item => item.ticket_count);
      if (ticketCountsForVolatility.length > 0) {
        // Calculate mean
        const mean = ticketCountsForVolatility.reduce((sum, count) => sum + count, 0) / ticketCountsForVolatility.length;
        
        // Calculate variance and standard deviation
        const squaredDifferences = ticketCountsForVolatility.map(count => Math.pow(count - mean, 2));
        const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / ticketCountsForVolatility.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Standard error of the mean
        const standardError = standardDeviation / Math.sqrt(ticketCountsForVolatility.length);
        
        // Coefficient of variation (standard deviation / mean)
        const coefficientOfVariation = mean !== 0 ? (standardDeviation / mean) * 100 : 0;
        
        // Range (max - min)
        const min = Math.min(...ticketCountsForVolatility);
        const max = Math.max(...ticketCountsForVolatility);
        const range = max - min;
        
        // Interquartile range (IQR)
        const sortedData = [...ticketCountsForVolatility].sort((a, b) => a - b);
        const q1Index = Math.floor(sortedData.length * 0.25);
        const q3Index = Math.floor(sortedData.length * 0.75);
        const q1 = sortedData[q1Index];
        const q3 = sortedData[q3Index];
        const iqr = q3 - q1;
        
        // Mean absolute deviation (MAD)
        const absoluteDeviations = ticketCountsForVolatility.map(count => Math.abs(count - mean));
        const meanAbsoluteDeviation = absoluteDeviations.reduce((sum, diff) => sum + diff, 0) / ticketCountsForVolatility.length;
        
        // Median absolute deviation (MAD)
        const median = sortedData[Math.floor(sortedData.length / 2)];
        const medianAbsoluteDeviations = ticketCountsForVolatility.map(count => Math.abs(count - median));
        const sortedMAD = [...medianAbsoluteDeviations].sort((a, b) => a - b);
        const medianAbsoluteDeviation = sortedMAD[Math.floor(sortedMAD.length / 2)];
        
        // Skewness (measure of asymmetry)
        const skewness = ticketCountsForVolatility.length > 2 ? 
          (ticketCountsForVolatility.reduce((sum, count) => sum + Math.pow(count - mean, 3), 0) / ticketCountsForVolatility.length) / Math.pow(standardDeviation, 3) : 0;
        
        // Kurtosis (measure of tailedness)
        const kurtosis = ticketCountsForVolatility.length > 3 ? 
          (ticketCountsForVolatility.reduce((sum, count) => sum + Math.pow(count - mean, 4), 0) / ticketCountsForVolatility.length) / Math.pow(variance, 2) - 3 : 0;
        
        // Set state values
        setTicketVolatility(standardDeviation.toFixed(2));
        setTicketVariance(variance.toFixed(2));
        setTicketCoefficientOfVariation(coefficientOfVariation.toFixed(2));
        
        // Enhanced rolling volatility calculations
        const enhancedRollingVolatility: number[] = [];
        const rollingVariance: number[] = [];
        const rollingSkewness: number[] = [];
        const rollingKurtosis: number[] = [];
        
        for (let i = 0; i < ticketCountsForVolatility.length; i++) {
          // Determine window size (at least 3 points, max 7 points)
          const windowSize = Math.min(Math.max(3, Math.floor(ticketCountsForVolatility.length * 0.2)), 7);
          const start = Math.max(0, i - Math.floor(windowSize / 2));
          const end = Math.min(ticketCountsForVolatility.length, i + Math.floor(windowSize / 2) + 1);
          const window = ticketCountsForVolatility.slice(start, end);
          
          if (window.length >= 3) {
            // Calculate window statistics
            const windowMean = window.reduce((sum, val) => sum + val, 0) / window.length;
            const windowSquaredDifferences = window.map(val => Math.pow(val - windowMean, 2));
            const windowVariance = windowSquaredDifferences.reduce((sum, diff) => sum + diff, 0) / window.length;
            const windowStdDev = Math.sqrt(windowVariance);
            
            // Rolling standard deviation
            enhancedRollingVolatility.push(windowStdDev);
            rollingVariance.push(windowVariance);
            
            // Rolling skewness
            if (windowStdDev !== 0) {
              const windowCubedDifferences = window.map(val => Math.pow(val - windowMean, 3));
              const windowSkewness = (windowCubedDifferences.reduce((sum, diff) => sum + diff, 0) / window.length) / Math.pow(windowStdDev, 3);
              rollingSkewness.push(windowSkewness);
            } else {
              rollingSkewness.push(0);
            }
            
            // Rolling kurtosis
            if (windowVariance !== 0) {
              const windowFourthDifferences = window.map(val => Math.pow(val - windowMean, 4));
              const windowKurtosis = (windowFourthDifferences.reduce((sum, diff) => sum + diff, 0) / window.length) / Math.pow(windowVariance, 2) - 3;
              rollingKurtosis.push(windowKurtosis);
            } else {
              rollingKurtosis.push(0);
            }
          } else {
            // For small windows, use simple values
            enhancedRollingVolatility.push(0);
            rollingVariance.push(0);
            rollingSkewness.push(0);
            rollingKurtosis.push(0);
          }
        }
        
        setTicketRollingVolatility(enhancedRollingVolatility);
        
        // Add a console log for debugging the enhanced statistics
        console.log('Enhanced Volatility Statistics:', {
          mean: mean.toFixed(2),
          variance: variance.toFixed(2),
          standardDeviation: standardDeviation.toFixed(2),
          standardError: standardError.toFixed(2),
          coefficientOfVariation: coefficientOfVariation.toFixed(2),
          range: range.toFixed(2),
          iqr: iqr.toFixed(2),
          meanAbsoluteDeviation: meanAbsoluteDeviation.toFixed(2),
          medianAbsoluteDeviation: medianAbsoluteDeviation.toFixed(2),
          skewness: skewness.toFixed(2),
          kurtosis: kurtosis.toFixed(2)
        });
      }
      
      // Enhanced correlation analysis with statistical significance testing and confidence intervals
      if (transformedTicketData.length >= 3) { // Need at least 3 points for meaningful correlation
        const ticketValues = transformedTicketData.map(item => item.ticket_count);
        const revenueValues = transformedTicketData.map(item => item.total_revenue);
        
        // Use enhanced correlation with statistical significance testing and confidence intervals
        const correlationResult = dashboardDb.calculateEnhancedCorrelation(ticketValues, revenueValues);
        
        setTicketRevenueCorrelation(correlationResult.correlation.toFixed(4));
        setTicketRevenueCorrelationPValue(correlationResult.pValue.toFixed(4));
        // Consider correlation significant if p-value < 0.05
        setTicketRevenueCorrelationSignificant(correlationResult.pValue < 0.05);
        
        // Log additional information for debugging
        console.log('Enhanced Correlation Analysis:', {
          correlation: correlationResult.correlation.toFixed(4),
          pValue: correlationResult.pValue.toFixed(4),
          confidenceInterval: `[${correlationResult.confidenceInterval[0].toFixed(4)}, ${correlationResult.confidenceInterval[1].toFixed(4)}]`,
          isSignificant: correlationResult.pValue < 0.05
        });
      } else if (transformedTicketData.length === 2) {
        // For exactly 2 points, calculate simple correlation
        const ticketValues = transformedTicketData.map(item => item.ticket_count);
        const revenueValues = transformedTicketData.map(item => item.total_revenue);
        
        // Calculate means
        const ticketMean = ticketValues.reduce((sum, val) => sum + val, 0) / ticketValues.length;
        const revenueMean = revenueValues.reduce((sum, val) => sum + val, 0) / revenueValues.length;
        
        // Calculate correlation coefficient
        let numerator = 0;
        let denomTicket = 0;
        let denomRevenue = 0;
        
        for (let i = 0; i < ticketValues.length; i++) {
          const ticketDiff = ticketValues[i] - ticketMean;
          const revenueDiff = revenueValues[i] - revenueMean;
          numerator += ticketDiff * revenueDiff;
          denomTicket += Math.pow(ticketDiff, 2);
          denomRevenue += Math.pow(revenueDiff, 2);
        }
        
        const denominator = Math.sqrt(denomTicket * denomRevenue);
        const correlation = denominator !== 0 ? numerator / denominator : 0;
        
        setTicketRevenueCorrelation(correlation.toFixed(4));
        setTicketRevenueCorrelationPValue('N/A');
        setTicketRevenueCorrelationSignificant(false);
      } else {
        // Not enough data points
        setTicketRevenueCorrelation('0.0000');
        setTicketRevenueCorrelationPValue('N/A');
        setTicketRevenueCorrelationSignificant(false);
      }
      
      // Enhanced regression analysis with multiple models (linear, polynomial, logarithmic)
      if (transformedTicketData.length >= 3) { // Need at least 3 points for meaningful regression analysis
        const xValues = transformedTicketData.map((_, index) => index + 1); // 1-indexed periods
        const yValues = transformedTicketData.map(item => item.ticket_count);
        
        // Calculate multiple regression models
        const linearModel = dashboardDb.calculateLinearRegression(xValues, yValues);
        const polynomialModel = dashboardDb.calculatePolynomialRegression(xValues, yValues);
        const logarithmicModel = dashboardDb.calculateLogarithmicRegression(xValues, yValues);
        
        // Select best model based on R-squared
        const models = [
          { name: 'linear', rSquared: linearModel.rSquared, model: linearModel },
          { name: 'polynomial', rSquared: polynomialModel.rSquared, model: polynomialModel },
          { name: 'logarithmic', rSquared: logarithmicModel.rSquared, model: logarithmicModel }
        ];
        
        const bestModel = models.reduce((best, current) => 
          current.rSquared > best.rSquared ? current : best
        );
        
        // Set regression results
        setTicketRegression({ 
          slope: parseFloat(linearModel.slope.toFixed(2)), 
          intercept: parseFloat(linearModel.intercept.toFixed(2)) 
        });
        
        // Log detailed regression analysis for debugging
        console.log('Enhanced Regression Analysis:', {
          linear: {
            slope: linearModel.slope.toFixed(4),
            intercept: linearModel.intercept.toFixed(4),
            rSquared: linearModel.rSquared.toFixed(4)
          },
          polynomial: {
            coefficients: polynomialModel.coefficients.map(c => c.toFixed(4)),
            rSquared: polynomialModel.rSquared.toFixed(4)
          },
          logarithmic: {
            a: logarithmicModel.a.toFixed(4),
            b: logarithmicModel.b.toFixed(4),
            rSquared: logarithmicModel.rSquared.toFixed(4)
          },
          bestModel: bestModel.name,
          bestRSquared: bestModel.rSquared.toFixed(4)
        });
      } else if (transformedTicketData.length === 2) {
        // For exactly 2 points, calculate simple linear regression
        const xValues = transformedTicketData.map((_, index) => index);
        const yValues = transformedTicketData.map(item => item.ticket_count);
        
        // Calculate means
        const xMean = xValues.reduce((sum, val) => sum + val, 0) / xValues.length;
        const yMean = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
        
        // Calculate slope and intercept
        let numerator = 0;
        let denominator = 0;
        
        for (let i = 0; i < xValues.length; i++) {
          const xDiff = xValues[i] - xMean;
          const yDiff = yValues[i] - yMean;
          numerator += xDiff * yDiff;
          denominator += Math.pow(xDiff, 2);
        }
        
        const slope = denominator !== 0 ? numerator / denominator : 0;
        const intercept = yMean - slope * xMean;
        setTicketRegression({ slope: parseFloat(slope.toFixed(2)), intercept: parseFloat(intercept.toFixed(2)) });
      } else {
        // Not enough data points
        setTicketRegression({ slope: 0, intercept: 0 });
      }
      
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard chart data",
        variant: "destructive",
      });
    } finally {
      setDataLoading(prev => ({ ...prev, charts: false }));
    }
  }

  const fetchRecentTickets = async () => {
    try {
      setDataLoading(prev => ({ ...prev, tickets: true }))
      
      // Fetch real recent tickets data
      const tickets = await ticketsDb.getRecent(5)
      
      const transformedTickets = tickets.map(ticket => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number || '',
        status: ticket.status || '',
        customer_name: ticket.customer_name || '',
        device_brand: ticket.device_brand || '',
        device_model: ticket.device_model || '',
        created_at: ticket.created_at || ''
      }))
      
      setRecentTickets(transformedTickets)
    } catch (error) {
      console.error("Failed to fetch recent tickets:", error)
      toast({
        title: "Error",
        description: "Failed to fetch recent tickets",
        variant: "destructive",
      })
    } finally {
      setDataLoading(prev => ({ ...prev, tickets: false }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'pending_parts': return 'bg-orange-100 text-orange-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleNewTicket = () => {
    router.push('/admin/tickets/new')
  }

  const handleAddProduct = () => {
    router.push('/admin/products')
  }

  const handleNewCustomer = () => {
    router.push('/admin/customers')
  }

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
    // Save to localStorage for persistence
    localStorage.setItem('dashboardTimeframe', newTimeframe);
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your business metrics</p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Timeframe:</span>
            <Select value={timeframe} onValueChange={(value) => handleTimeframeChange(value as Timeframe)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color.replace('bg-', 'text-')}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Ticket Trends
              </CardTitle>
              <CardDescription>
                Ticket volume trends over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ticketData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }} 
                    formatter={(value, name) => {
                      if (name === 'ticket_count') return [value, 'Tickets'];
                      if (name === 'unique_customers') return [value, 'Customers'];
                      if (name === 'total_revenue') return [`KSh ${value.toLocaleString()}`, 'Revenue'];
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="ticket_count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Tickets" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Ticket Volume Analysis
              </CardTitle>
              <CardDescription>
                Statistical analysis of ticket volume trends with enhanced moving averages
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ticketData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }} 
                    formatter={(value, name) => {
                      if (name === 'ticket_count') return [value, 'Tickets'];
                      if (name === 'simple_moving_average') return [typeof value === 'number' ? value.toFixed(2) : value, 'Simple MA'];
                      if (name === 'weighted_moving_average') return [typeof value === 'number' ? value.toFixed(2) : value, 'Weighted MA'];
                      if (name === 'exponential_moving_average') return [typeof value === 'number' ? value.toFixed(2) : value, 'Exponential MA'];
                      if (name === 'double_exponential_level') return [typeof value === 'number' ? value.toFixed(2) : value, 'Holt-Winters'];
                      return [value, name];
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ticket_count" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                    name="Ticket Volume" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="simple_moving_average" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2} 
                    strokeDasharray="5 5" 
                    name="Simple Moving Average" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weighted_moving_average" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2} 
                    name="Weighted Moving Average" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="exponential_moving_average" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2} 
                    strokeDasharray="3 3" 
                    name="Exponential Moving Average" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="double_exponential_level" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2} 
                    strokeDasharray="2 2" 
                    name="Double Exponential (Holt-Winters)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section Continued */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Ticket Status Distribution
              </CardTitle>
              <CardDescription>
                Current distribution of ticket statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={ticketStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ status, count }) => `${status}: ${count}`}
                  >
                    {ticketStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }} 
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Top Selling Products
              </CardTitle>
              <CardDescription>
                Best performing products by revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }} 
                    formatter={(value, name) => {
                      if (name === 'total_revenue') return [`KSh ${value.toLocaleString()}`, 'Revenue'];
                      if (name === 'total_quantity_sold') return [value, 'Quantity Sold'];
                      return [value, name];
                    }}
                    labelFormatter={(value) => `Product: ${value}`}
                  />
                  <Bar 
                    dataKey="total_revenue" 
                    fill="hsl(var(--primary))" 
                    name="Revenue" 
                    radius={[0, 4, 4, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Statistical Insights */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Statistical Insights
            </CardTitle>
            <CardDescription>
              Advanced analytics for business decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex flex-col h-full justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Ticket Volume Trend</h3>
                  <p className="text-2xl font-bold mt-2">
                    {ticketTrendDirection === 'up' ? '↗️' : 
                     ticketTrendDirection === 'down' ? '↘️' : '➡️'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ticketTrendDirection === 'up' ? 'Increasing' : 
                     ticketTrendDirection === 'down' ? 'Decreasing' : 'Stable'}
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Volume Volatility</h3>
                  <p className="text-2xl font-bold mt-2">{ticketVolatility}</p>
                  <p className="text-sm text-muted-foreground">Standard Deviation</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Coefficient of Variation</h3>
                  <p className="text-2xl font-bold mt-2">{ticketCoefficientOfVariation}%</p>
                  <p className="text-sm text-muted-foreground">Volatility Relative to Mean</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Tickets vs Revenue Correlation</h3>
                  <p className="text-2xl font-bold mt-2">{ticketRevenueCorrelation}</p>
                  <p className="text-sm text-muted-foreground">
                    {ticketRevenueCorrelationPValue !== 'N/A' ? `p-value: ${ticketRevenueCorrelationPValue}` : 'Correlation'}
                    {ticketRevenueCorrelationSignificant && ticketRevenueCorrelationPValue !== 'N/A' && ' (significant)'}
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Regression Slope</h3>
                  <p className="text-2xl font-bold mt-2">{ticketRegression.slope}</p>
                  <p className="text-sm text-muted-foreground">Ticket Trend Slope</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Regression Intercept</h3>
                  <p className="text-2xl font-bold mt-2">{ticketRegression.intercept}</p>
                  <p className="text-sm text-muted-foreground">Y-axis Intercept</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Data Points</h3>
                  <p className="text-2xl font-bold mt-2">{ticketData.length}</p>
                  <p className="text-sm text-muted-foreground">Time Periods Analyzed</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Forecast Accuracy</h3>
                  <p className="text-2xl font-bold mt-2">95%</p>
                  <p className="text-sm text-muted-foreground">Confidence Interval</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period-over-Period and Forecast Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Period-over-Period Comparison
              </CardTitle>
              <CardDescription>
                Ticket and revenue growth compared to previous period
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodOverPeriodData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }} 
                    formatter={(value, name, props) => {
                      if (name === 'current_period_tickets' || name === 'previous_period_tickets') {
                        return [value, 'Tickets'];
                      }
                      if (name === 'current_period_revenue' || name === 'previous_period_revenue') {
                        return [`KSh ${value.toLocaleString()}`, 'Revenue'];
                      }
                      if (name === 'ticket_growth_rate' || name === 'revenue_growth_rate') {
                        const isSignificant = props.payload[`${name}_significant`];
                        return [`${value}%${isSignificant ? '*' : ''}`, 'Growth Rate'];
                      }
                      return [value, name];
                    }}
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="current_period_tickets" 
                    fill="hsl(var(--primary))" 
                    name="Current Period Tickets" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Bar 
                    yAxisId="left"
                    dataKey="previous_period_tickets" 
                    fill="hsl(var(--secondary))" 
                    name="Previous Period Tickets" 
                    radius={[4, 4, 0, 0]} 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="ticket_growth_rate" 
                    stroke="hsl(var(--accent-foreground))" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                    name="Ticket Growth %" 
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue_growth_rate" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2} 
                    strokeDasharray="3 3"
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                    name="Revenue Growth %" 
                  />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 justify-center mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-[hsl(var(--accent-foreground))]" />
                  <span className="text-sm">Ticket Growth %</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-[hsl(var(--destructive))]" />
                  <span className="text-sm">Revenue Growth %</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">* = Statistically Significant</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Forecast Analysis
              </CardTitle>
              <CardDescription>
                Predicted ticket volumes and revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.5rem'
                    }} 
                    formatter={(value, name) => {
                      if (name === 'predicted_tickets') return [value, 'Predicted Tickets'];
                      if (name === 'predicted_revenue') return [`KSh ${value.toLocaleString()}`, 'Predicted Revenue'];
                      if (name === 'ticket_confidence_lower' || name === 'ticket_confidence_upper') return [value, 'Ticket Confidence Interval'];
                      if (name === 'revenue_confidence_lower' || name === 'revenue_confidence_upper') return [`KSh ${value.toLocaleString()}`, 'Revenue Confidence Interval'];
                      return [value, name];
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ticket_confidence_lower" 
                    stroke="none" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.1} 
                    name="Ticket Lower Confidence"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ticket_confidence_upper" 
                    stroke="none" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.1} 
                    name="Ticket Upper Confidence"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue_confidence_lower" 
                    stroke="none" 
                    fill="hsl(var(--secondary))" 
                    fillOpacity={0.1} 
                    name="Revenue Lower Confidence"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue_confidence_upper" 
                    stroke="none" 
                    fill="hsl(var(--secondary))" 
                    fillOpacity={0.1} 
                    name="Revenue Upper Confidence"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted_tickets" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                    name="Predicted Tickets" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted_revenue" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                    name="Predicted Revenue (KSh)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Forecasting Methods */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Advanced Forecasting Methods
            </CardTitle>
            <CardDescription>
              Comparison of different forecasting approaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>Advanced forecasting methods visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tickets and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Tickets
              </CardTitle>
              <CardDescription>
                Latest repair tickets and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No tickets found</p>
                  </div>
                ) : (
                  recentTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ticket.ticket_number}</p>
                          <Badge className={getStatusColor(ticket.status)} variant="secondary">
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ticket.customer_name} • {ticket.device_brand} {ticket.device_model}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/tickets/${ticket.id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common tasks you can perform quickly
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2 hover:shadow-md transition-all" 
                onClick={handleNewTicket}
              >
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <Wrench className="h-5 w-5 text-blue-500" />
                </div>
                <span>New Ticket</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2 hover:shadow-md transition-all" 
                onClick={handleAddProduct}
              >
                <div className="p-2 bg-green-500/10 rounded-full">
                  <Package className="h-5 w-5 text-green-500" />
                </div>
                <span>Add Product</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2 hover:shadow-md transition-all" 
                onClick={handleNewCustomer}
              >
                <div className="p-2 bg-orange-500/10 rounded-full">
                  <Users className="h-5 w-5 text-orange-500" />
                </div>
                <span>New Customer</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Enhanced correlation calculation using database function
// This function is kept for backward compatibility but delegates to the database implementation
const calculatePearsonCorrelation = (x: number[], y: number[]): { correlation: number, pValue: number } => {
  if (x.length !== y.length || x.length < 2) {
    return { correlation: 0, pValue: 1 };
  }
  
  // Use the enhanced correlation function from the database
  const result = dashboardDb.calculateEnhancedCorrelation(x, y);
  return { correlation: result.correlation, pValue: result.pValue };
};

// Simple approximation of cumulative normal distribution
const cumulativeNormalDistribution = (x: number): number => {
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
};
