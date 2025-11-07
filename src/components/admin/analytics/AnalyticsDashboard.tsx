"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart as RechartsPieChart, Pie, Cell, 
         XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { redirect } from 'next/navigation';
import { dashboardDb, Timeframe } from '@/lib/db/dashboard';
import { ticketsDb } from '@/lib/db/tickets';
import { productsDb } from '@/lib/db/products';
import ImprovedTicketStatusChart from './ImprovedTicketStatusChart';

// Types
type TicketData = {
  period: string;
  ticket_count: number;
  unique_customers: number;
  total_revenue: number;
  moving_average?: number;
}

type TicketStatusData = {
  status: string;
  count: number;
  percentage: number;
}

type TopProduct = {
  name: string;
  total_revenue: number;
  total_quantity_sold: number;
}

type PeriodOverPeriodData = {
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

type ForecastData = {
  period: string;
  predicted_tickets: number;
  predicted_revenue: number;
  ticket_confidence_lower: number;
  ticket_confidence_upper: number;
  revenue_confidence_lower: number;
  revenue_confidence_upper: number;
}

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  // State
  const [timeframe, setTimeframe] = useState<Timeframe>(() => {
    if (typeof window !== 'undefined') {
      const savedTimeframe = localStorage.getItem('analyticsTimeframe');
      if (savedTimeframe && ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(savedTimeframe)) {
        return savedTimeframe as Timeframe;
      }
    }
    return 'daily';
  });

  // New state for revenue type toggle
  const [revenueType, setRevenueType] = useState<'all' | 'paid'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [ticketStatusData, setTicketStatusData] = useState<TicketStatusData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [periodOverPeriodData, setPeriodOverPeriodData] = useState<PeriodOverPeriodData[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  
  // Statistical analysis data
  const [ticketMovingAverage, setTicketMovingAverage] = useState<number[]>([]);
  const [ticketTrendDirection, setTicketTrendDirection] = useState<'up' | 'down' | 'stable'>('stable');
  const [ticketVolatility, setTicketVolatility] = useState<string>('0');
  const [ticketVariance, setTicketVariance] = useState<string>('0');
  const [ticketCoefficientOfVariation, setTicketCoefficientOfVariation] = useState<string>('0');
  const [ticketRollingVolatility, setTicketRollingVolatility] = useState<number[]>([]);
  const [ticketRevenueCorrelation, setTicketRevenueCorrelation] = useState<string>('0');
  const [ticketRevenueCorrelationPValue, setTicketRevenueCorrelationPValue] = useState<string>('0');
  const [ticketRevenueCorrelationSignificant, setTicketRevenueCorrelationSignificant] = useState<boolean>(false);
  const [ticketRegression, setTicketRegression] = useState<{slope: number, intercept: number}>({slope: 0, intercept: 0});
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState({
    charts: true,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        redirect('/login');
      }
    }
  }, [user, authLoading]);

  // Fetch all analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe, revenueType]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // Refresh materialized views to ensure data is up to date
      await refreshAnalyticsData();
      
      // Fetch chart data
      await fetchChartData();
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalyticsData = async () => {
    try {
      setIsRefreshing(true);
      await dashboardDb.refreshMaterializedViews();
      setLastRefreshed(new Date());
      console.log('Analytics data refreshed at:', new Date());
    } catch (error) {
      console.error("Failed to refresh analytics data:", error);
      toast({
        title: "Refresh Error",
        description: "Failed to refresh analytics data. Showing cached data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setDataLoading(prev => ({ ...prev, charts: true }));
      
      // Fetch ticket trends data based on revenue type
      let trendsData;
      if (revenueType === 'paid') {
        trendsData = await dashboardDb.getRevenueTrendsPaidOnly(timeframe);
      } else {
        trendsData = await dashboardDb.getRevenueTrends(timeframe);
      }
      
      // Convert TrendsData to TicketData format
      const ticketDataFormatted: TicketData[] = trendsData.map(item => ({
        period: item.period,
        ticket_count: item.ticket_count,
        unique_customers: item.unique_customers,
        total_revenue: item.total_revenue,
        moving_average: undefined
      }));
      
      setTicketData(ticketDataFormatted);
      
      // Calculate moving averages and statistical analysis
      if (ticketDataFormatted.length > 0) {
        // Calculate 7-day moving average
        const movingAverages = [];
        const period = Math.min(7, ticketDataFormatted.length);
        
        for (let i = period - 1; i < ticketDataFormatted.length; i++) {
          const sum = ticketDataFormatted.slice(i - period + 1, i + 1)
            .reduce((acc, curr) => acc + curr.ticket_count, 0);
          movingAverages.push(sum / period);
        }
        
        // Add moving averages to ticket data
        const ticketDataWithMA = [...ticketDataFormatted];
        for (let i = period - 1; i < ticketDataWithMA.length; i++) {
          ticketDataWithMA[i] = {
            ...ticketDataWithMA[i],
            moving_average: movingAverages[i - period + 1]
          };
        }
        setTicketData(ticketDataWithMA);
        
        // Calculate trend direction
        if (movingAverages.length >= 2) {
          const last = movingAverages[movingAverages.length - 1];
          const previous = movingAverages[movingAverages.length - 2];
          if (last > previous * 1.05) {
            setTicketTrendDirection('up');
          } else if (last < previous * 0.95) {
            setTicketTrendDirection('down');
          } else {
            setTicketTrendDirection('stable');
          }
        }
        
        // Calculate volatility metrics
        const ticketCounts = ticketDataFormatted.map(d => d.ticket_count);
        const mean = ticketCounts.reduce((sum, count) => sum + count, 0) / ticketCounts.length;
        const variance = ticketCounts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / ticketCounts.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = mean > 0 ? (stdDev / mean * 100).toFixed(2) : '0';
        
        setTicketVariance(variance.toFixed(2));
        setTicketVolatility(stdDev.toFixed(2));
        setTicketCoefficientOfVariation(coefficientOfVariation);
      }
      
      // Fetch ticket status distribution
      const statusData = await dashboardDb.getTicketStatusDistribution();
      console.log('Analytics Dashboard - Raw ticket status data from materialized view:', statusData);
      
      // For debugging, also calculate status distribution directly
      try {
        const directStatusData = await dashboardDb.calculateTicketStatusDistribution();
        console.log('Analytics Dashboard - Directly calculated ticket status data:', directStatusData);
        
        // Compare the two datasets
        console.log('Analytics Dashboard - Comparison - Materialized View vs Direct Calculation:');
        statusData.forEach(materialized => {
          const direct = directStatusData.find(d => d.status === materialized.status);
          if (direct) {
            console.log(`Status: ${materialized.status}, Materialized: ${materialized.count}, Direct: ${direct.count}, Match: ${materialized.count === direct.count}`);
          } else {
            console.log(`Status: ${materialized.status} exists in materialized view but not in direct calculation`);
          }
        });
        
        directStatusData.forEach(direct => {
          const materialized = statusData.find(m => m.status === direct.status);
          if (!materialized) {
            console.log(`Status: ${direct.status} exists in direct calculation but not in materialized view`);
          }
        });
      } catch (calcError) {
        console.error('Error calculating direct status distribution:', calcError);
      }
      
      setTicketStatusData(statusData);
      
      // Fetch top products
      const productsData = await dashboardDb.getTopProductsBySales();
      setTopProducts(productsData);
      
      // Fetch period-over-period data
      const periodData = await dashboardDb.getPeriodOverPeriodComparison(timeframe);
      setPeriodOverPeriodData(periodData);
      
      // Fetch forecast data
      const forecastData = await dashboardDb.getForecastData(timeframe);
      setForecastData(forecastData);
      
      // Calculate correlation between tickets and revenue
      if (ticketDataFormatted.length > 1) {
        const ticketCounts = ticketDataFormatted.map(d => d.ticket_count);
        const revenues = ticketDataFormatted.map(d => d.total_revenue);
        
        // Simple correlation calculation
        const n = ticketCounts.length;
        const sumX = ticketCounts.reduce((sum, x) => sum + x, 0);
        const sumY = revenues.reduce((sum, y) => sum + y, 0);
        const sumXY = ticketCounts.reduce((sum, x, i) => sum + x * revenues[i], 0);
        const sumX2 = ticketCounts.reduce((sum, x) => sum + x * x, 0);
        const sumY2 = revenues.reduce((sum, y) => sum + y * y, 0);
        
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        
        if (denominator !== 0) {
          const correlation = numerator / denominator;
          setTicketRevenueCorrelation(correlation.toFixed(4));
          
          // Simple regression calculation
          const meanX = sumX / n;
          const meanY = sumY / n;
          const slope = denominator !== 0 ? numerator / (n * sumX2 - sumX * sumX) : 0;
          const intercept = meanY - slope * meanX;
          
          setTicketRegression({ slope, intercept });
        }
      }
      
    } catch (error: any) {
      console.error('Error fetching chart data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch chart data",
        variant: "destructive",
      });
    } finally {
      setDataLoading(prev => ({ ...prev, charts: false }));
    }
  };

  // Handle timeframe change
  const handleTimeframeChange = (value: Timeframe) => {
    setTimeframe(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem('analyticsTimeframe', value);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Advanced insights and business intelligence
            </p>
            {lastRefreshed && (
              <p className="text-xs text-muted-foreground mt-1">
                Last refreshed: {lastRefreshed.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </Button>
            
            {/* Revenue Type Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Revenue:</span>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm font-medium rounded-l-lg border ${
                    revenueType === 'all' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-input hover:bg-accent'
                  }`}
                  onClick={() => setRevenueType('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-sm font-medium rounded-r-lg border ${
                    revenueType === 'paid' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-background text-foreground border-input hover:bg-accent'
                  }`}
                  onClick={() => setRevenueType('paid')}
                >
                  Paid Only
                </button>
              </div>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Timeframe:</span>
              <Select value={timeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
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
        </div>
      </div>

      {/* Ticket Trends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Trends</CardTitle>
              <CardDescription>Ticket volume trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              {dataLoading.charts ? (
                <div className="flex items-center justify-center h-80">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : ticketData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ticketData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                          if (timeframe === 'daily') return value.split(' ')[0];
                          return value;
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value) => [value, 'Tickets']}
                        labelFormatter={(label) => `Period: ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ticket_count" 
                        name="Ticket Volume" 
                        stroke="#8884d8" 
                        fill="#8884d8" 
                        fillOpacity={0.3}
                      />
                      {ticketData.some(d => d.moving_average !== undefined) && (
                        <Line 
                          type="monotone" 
                          dataKey="moving_average" 
                          name="Moving Average" 
                          stroke="#ff7300" 
                          strokeWidth={2}
                          dot={false}
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-80 text-muted-foreground">
                  No ticket data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Volume Analysis */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Ticket Volume Analysis</CardTitle>
              <CardDescription>Statistical analysis of ticket volume trends with enhanced moving averages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Trend</div>
                  <div className="font-semibold flex items-center gap-2">
                    {ticketTrendDirection === 'up' ? '↗️' : ticketTrendDirection === 'down' ? '↘️' : '➡️'}
                    <span className="capitalize">{ticketTrendDirection}</span>
                  </div>
                </div>
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Volatility</div>
                  <div className="font-semibold">{ticketVolatility}</div>
                  <div className="text-xs text-muted-foreground">Standard Deviation</div>
                </div>
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Coefficient of Variation</div>
                  <div className="font-semibold">{ticketCoefficientOfVariation}%</div>
                  <div className="text-xs text-muted-foreground">Volatility Relative to Mean</div>
                </div>
                <div className="bg-secondary/10 p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Tickets vs Revenue Correlation</div>
                  <div className="font-semibold">{ticketRevenueCorrelation}</div>
                  <div className="text-xs text-muted-foreground">
                    {ticketRevenueCorrelationSignificant ? '* = Statistically Significant' : 'Correlation'}
                  </div>
                </div>
              </div>
              
              <div className="bg-secondary/10 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Regression Analysis</div>
                <div className="font-semibold">Slope: {ticketRegression.slope.toFixed(4)}</div>
                <div className="text-sm">Y-axis Intercept: {ticketRegression.intercept.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ticket Trend Slope
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Data Points: {ticketData.length} | 
                Time Periods Analyzed
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ticket Status Distribution and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Status Distribution */}
        <div className="lg:col-span-2">
          <ImprovedTicketStatusChart 
            data={ticketStatusData.map(item => ({ 
              status: item.status, 
              count: item.count 
            }))} 
            title="Ticket Status Distribution"
            height={400}
          />
        </div>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {dataLoading.charts ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : topProducts.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value) => [`KSh ${value}`, 'Revenue']}
                      labelFormatter={(label) => `Product: ${label}`}
                    />
                    <Bar dataKey="total_revenue" name="Revenue" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Period-over-Period Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Period-over-Period Comparison</CardTitle>
          <CardDescription>Ticket and revenue growth compared to previous period</CardDescription>
        </CardHeader>
        <CardContent>
          {dataLoading.charts ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : periodOverPeriodData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={periodOverPeriodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="ticket_growth_rate" 
                    name="Ticket Growth %" 
                    fill="#00C49F"
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="revenue_growth_rate" 
                    name="Revenue Growth %" 
                    fill="#FFBB28"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No period-over-period data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Forecast Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Analysis</CardTitle>
          <CardDescription>Predicted ticket volumes and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {dataLoading.charts ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : forecastData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="predicted_tickets" 
                    name="Predicted Tickets" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="predicted_revenue" 
                    name="Predicted Revenue" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="ticket_confidence_lower" 
                    name="Ticket Lower Bound" 
                    stroke="#8884d8" 
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="ticket_confidence_upper" 
                    name="Ticket Upper Bound" 
                    stroke="#8884d8" 
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              No forecast data available
            </div>
          )}
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Forecast Accuracy: 95% Confidence Interval
          </div>
        </CardContent>
      </Card>

      {/* Advanced Forecasting Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Forecasting Methods</CardTitle>
          <CardDescription>Comparison of different forecasting approaches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 font-medium">Advanced forecasting methods visualization</h3>
            <p className="text-muted-foreground mt-1">
              Coming soon
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}