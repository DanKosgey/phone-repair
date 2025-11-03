"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { dashboardDb } from '@/lib/db/dashboard'
import { ticketsDb } from '@/lib/db/tickets'
import { productsDb } from '@/lib/db/products'
import { customersDb } from '@/lib/db/customers'
import { ordersDb } from '@/lib/db/orders'

// Types
type StatCard = {
  title: string
  value: string
  change: string
  icon: any
  color: string
}

type MonthlyTicketData = {
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

type YearOverYearData = {
  month: string
  current_year_tickets: number
  previous_year_tickets: number
  current_year_revenue: number
  previous_year_revenue: number
  ticket_growth_rate: number
  revenue_growth_rate: number
}

type ForecastData = {
  month: string
  predicted_tickets: number
  predicted_revenue: number
  confidence_lower: number
  confidence_upper: number
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
  const [stats, setStats] = useState<StatCard[]>([
    { title: "Total Revenue", value: "KSh 0", change: "+0% from last month", icon: Package, color: "bg-blue-500" },
    { title: "Tickets", value: "0", change: "+0% from last month", icon: BarChart3, color: "bg-green-500" },
    { title: "Customers", value: "0", change: "+0% from last month", icon: Users, color: "bg-orange-500" },
    { title: "Orders", value: "0", change: "+0% from last month", icon: ShoppingCart, color: "bg-purple-500" },
  ])
  
  const [monthlyTicketData, setMonthlyTicketData] = useState<MonthlyTicketData[]>([])
  const [ticketStatusData, setTicketStatusData] = useState<TicketStatusData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [customerLifetimeValue, setCustomerLifetimeValue] = useState<CustomerLifetimeValue[]>([])
  const [yearOverYearData, setYearOverYearData] = useState<YearOverYearData[]>([])
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  
  // Statistical analysis data
  const [ticketMovingAverage, setTicketMovingAverage] = useState<number[]>([])
  const [ticketTrendDirection, setTicketTrendDirection] = useState<'up' | 'down' | 'stable'>('stable')
  const [ticketVolatility, setTicketVolatility] = useState<string>('0')
  const [ticketRevenueCorrelation, setTicketRevenueCorrelation] = useState<string>('0')
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
  }, [])

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
      
      setStats([
        { 
          title: "Total Revenue", 
          value: `KSh ${data.total_revenue?.toLocaleString() || '0'}`, 
          change: "+0% from last month", 
          icon: Package, 
          color: "bg-blue-500" 
        },
        { 
          title: "Tickets", 
          value: data.total_tickets?.toString() || '0', 
          change: "+0% from last month", 
          icon: BarChart3, 
          color: "bg-green-500" 
        },
        { 
          title: "Customers", 
          value: data.total_customers?.toString() || '0', 
          change: "+0% from last month", 
          icon: Users, 
          color: "bg-orange-500" 
        },
        { 
          title: "Orders", 
          value: data.total_orders?.toString() || '0', 
          change: "+0% from last month", 
          icon: ShoppingCart, 
          color: "bg-purple-500" 
        },
      ])
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setDataLoading(prev => ({ ...prev, stats: false }))
    }
  }

  const fetchChartData = async () => {
    try {
      setDataLoading(prev => ({ ...prev, charts: true }))
      
      // Mock data for demonstration
      // In a real implementation, you would fetch this from your database
      const mockMonthlyData: MonthlyTicketData[] = [
        { name: 'Jan', ticket_count: 45, unique_customers: 30, total_revenue: 120000 },
        { name: 'Feb', ticket_count: 52, unique_customers: 35, total_revenue: 145000 },
        { name: 'Mar', ticket_count: 48, unique_customers: 32, total_revenue: 132000 },
        { name: 'Apr', ticket_count: 61, unique_customers: 42, total_revenue: 168000 },
        { name: 'May', ticket_count: 55, unique_customers: 38, total_revenue: 152000 },
        { name: 'Jun', ticket_count: 67, unique_customers: 45, total_revenue: 185000 },
        { name: 'Jul', ticket_count: 62, unique_customers: 41, total_revenue: 172000 },
        { name: 'Aug', ticket_count: 71, unique_customers: 48, total_revenue: 198000 },
        { name: 'Sep', ticket_count: 68, unique_customers: 46, total_revenue: 189000 },
        { name: 'Oct', ticket_count: 75, unique_customers: 52, total_revenue: 210000 },
        { name: 'Nov', ticket_count: 82, unique_customers: 56, total_revenue: 235000 },
        { name: 'Dec', ticket_count: 78, unique_customers: 53, total_revenue: 220000 },
      ]
      
      const mockStatusData: TicketStatusData[] = [
        { status: 'Open', count: 12 },
        { status: 'In Progress', count: 24 },
        { status: 'Pending Parts', count: 8 },
        { status: 'Completed', count: 45 },
        { status: 'Cancelled', count: 3 },
      ]
      
      const mockTopProducts: TopProduct[] = [
        { name: 'Screen Replacement', total_revenue: 85000, total_quantity_sold: 34 },
        { name: 'Battery Replacement', total_revenue: 62000, total_quantity_sold: 42 },
        { name: 'Camera Repair', total_revenue: 48000, total_quantity_sold: 28 },
        { name: 'Water Damage', total_revenue: 92000, total_quantity_sold: 19 },
        { name: 'Software Repair', total_revenue: 35000, total_quantity_sold: 52 },
      ]
      
      const mockCustomerData: CustomerLifetimeValue[] = [
        { name: 'John Doe', email: 'john@example.com', total_tickets: 12, total_lifetime_value: 45000 },
        { name: 'Jane Smith', email: 'jane@example.com', total_tickets: 8, total_lifetime_value: 32000 },
        { name: 'Robert Johnson', email: 'robert@example.com', total_tickets: 15, total_lifetime_value: 68000 },
        { name: 'Emily Davis', email: 'emily@example.com', total_tickets: 6, total_lifetime_value: 24000 },
        { name: 'Michael Wilson', email: 'michael@example.com', total_tickets: 11, total_lifetime_value: 41000 },
      ]
      
      const mockYearOverYear: YearOverYearData[] = [
        { month: 'Jan', current_year_tickets: 45, previous_year_tickets: 38, current_year_revenue: 120000, previous_year_revenue: 98000, ticket_growth_rate: 18.4, revenue_growth_rate: 22.4 },
        { month: 'Feb', current_year_tickets: 52, previous_year_tickets: 42, current_year_revenue: 145000, previous_year_revenue: 118000, ticket_growth_rate: 23.8, revenue_growth_rate: 22.9 },
        { month: 'Mar', current_year_tickets: 48, previous_year_tickets: 40, current_year_revenue: 132000, previous_year_revenue: 108000, ticket_growth_rate: 20.0, revenue_growth_rate: 22.2 },
        { month: 'Apr', current_year_tickets: 61, previous_year_tickets: 50, current_year_revenue: 168000, previous_year_revenue: 135000, ticket_growth_rate: 22.0, revenue_growth_rate: 24.4 },
        { month: 'May', current_year_tickets: 55, previous_year_tickets: 45, current_year_revenue: 152000, previous_year_revenue: 122000, ticket_growth_rate: 22.2, revenue_growth_rate: 24.6 },
        { month: 'Jun', current_year_tickets: 67, previous_year_tickets: 55, current_year_revenue: 185000, previous_year_revenue: 150000, ticket_growth_rate: 21.8, revenue_growth_rate: 23.3 },
      ]
      
      const mockForecast: ForecastData[] = [
        { month: 'Dec', predicted_tickets: 78, predicted_revenue: 220000, confidence_lower: 195000, confidence_upper: 245000 },
        { month: 'Jan', predicted_tickets: 85, predicted_revenue: 240000, confidence_lower: 210000, confidence_upper: 270000 },
        { month: 'Feb', predicted_tickets: 92, predicted_revenue: 260000, confidence_lower: 225000, confidence_upper: 295000 },
        { month: 'Mar', predicted_tickets: 88, predicted_revenue: 248000, confidence_lower: 215000, confidence_upper: 280000 },
        { month: 'Apr', predicted_tickets: 95, predicted_revenue: 268000, confidence_lower: 235000, confidence_upper: 300000 },
        { month: 'May', predicted_tickets: 102, predicted_revenue: 288000, confidence_lower: 250000, confidence_upper: 325000 },
      ]
      
      // Set mock data
      setMonthlyTicketData(mockMonthlyData)
      setTicketStatusData(mockStatusData)
      setTopProducts(mockTopProducts)
      setCustomerLifetimeValue(mockCustomerData)
      setYearOverYearData(mockYearOverYear)
      setForecastData(mockForecast)
      
      // Calculate moving average (3-month window)
      const movingAvg = mockMonthlyData.map((_, index) => {
        if (index < 2) return mockMonthlyData[index].ticket_count
        const sum = mockMonthlyData.slice(index-2, index+1).reduce((acc, curr) => acc + curr.ticket_count, 0)
        return sum / 3
      })
      setTicketMovingAverage(movingAvg)
      
      // Calculate trend direction (simplified)
      const firstHalf = mockMonthlyData.slice(0, 6).reduce((acc, curr) => acc + curr.ticket_count, 0) / 6
      const secondHalf = mockMonthlyData.slice(6).reduce((acc, curr) => acc + curr.ticket_count, 0) / 6
      setTicketTrendDirection(secondHalf > firstHalf ? 'up' : secondHalf < firstHalf ? 'down' : 'stable')
      
      // Mock volatility (standard deviation)
      setTicketVolatility('12.5')
      
      // Mock correlation
      setTicketRevenueCorrelation('0.85')
      
      // Mock regression
      setTicketRegression({slope: 0.75, intercept: 42.3})
      
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
    } finally {
      setDataLoading(prev => ({ ...prev, charts: false }))
    }
  }

  const fetchRecentTickets = async () => {
    try {
      setDataLoading(prev => ({ ...prev, tickets: true }))
      
      // Mock recent tickets data
      const mockTickets: RecentTicket[] = [
        { id: '1', ticket_number: 'TKT-2023-001', status: 'completed', customer_name: 'John Doe', device_brand: 'Samsung', device_model: 'Galaxy S21', created_at: '2023-11-15' },
        { id: '2', ticket_number: 'TKT-2023-002', status: 'in_progress', customer_name: 'Jane Smith', device_brand: 'Apple', device_model: 'iPhone 13', created_at: '2023-11-14' },
        { id: '3', ticket_number: 'TKT-2023-003', status: 'pending_parts', customer_name: 'Robert Johnson', device_brand: 'Google', device_model: 'Pixel 6', created_at: '2023-11-13' },
        { id: '4', ticket_number: 'TKT-2023-004', status: 'open', customer_name: 'Emily Davis', device_brand: 'Samsung', device_model: 'Galaxy Note 20', created_at: '2023-11-12' },
        { id: '5', ticket_number: 'TKT-2023-005', status: 'completed', customer_name: 'Michael Wilson', device_brand: 'Apple', device_model: 'iPhone 12', created_at: '2023-11-11' },
      ]
      
      setRecentTickets(mockTickets)
    } catch (error) {
      console.error("Failed to fetch recent tickets:", error)
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

  const handleNewOrder = () => {
    router.push('/admin/orders')
  }

  if (authLoading || isLoading) {
    return <div className="flex items-center justify-center h-full">Loading dashboard...</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {user?.email?.split('@')[0] || 'Admin'}. Here's what's happening today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color} bg-opacity-20`}>
                <stat.icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                {stat.change} from last month
              </p>
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
              Monthly Tickets Overview
            </CardTitle>
            <CardDescription>
              Ticket volume trends over the past year
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTicketData}>
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
              Statistical analysis of ticket volume trends
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTicketData}>
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
                    if (name === 'moving_average') return [value, 'Moving Average'];
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
                  dataKey="moving_average" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  name="3-Month Average" 
                  data={monthlyTicketData.map((d, i) => ({
                    ...d,
                    moving_average: ticketMovingAverage[i] || 0
                  }))}
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

      {/* Charts Section Continued */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Customer Lifetime Value
            </CardTitle>
            <CardDescription>
              Top customers by total lifetime value
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  type="number" 
                  dataKey="total_tickets" 
                  name="Tickets" 
                  label={{ value: 'Tickets', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="total_lifetime_value" 
                  name="Lifetime Value" 
                  tickFormatter={(value) => `KSh ${value?.toLocaleString()}`} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                  formatter={(value, name) => {
                    if (name === 'total_lifetime_value') return [`KSh ${value?.toLocaleString()}`, 'Lifetime Value'];
                    if (name === 'total_tickets') return [value, 'Tickets'];
                    return [value, name];
                  }}
                  labelFormatter={(value, payload) => {
                    const data = payload[0]?.payload;
                    return data?.name || data?.email || 'Customer';
                  }}
                />
                <Scatter 
                  name="Customers" 
                  data={customerLifetimeValue} 
                  fill="hsl(var(--primary))" 
                >
                  {customerLifetimeValue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#ef4444' : 'hsl(var(--primary))'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
              <div className="grid grid-cols-2 gap-4">
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
                  <p className="text-2xl font-bold mt-2">
                    {ticketVolatility}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Standard deviation
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Ticket-Revenue Correlation</h3>
                  <p className="text-2xl font-bold mt-2">
                    {ticketRevenueCorrelation}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Correlation coefficient
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary">Trend Line</h3>
                  <p className="text-2xl font-bold mt-2">
                    {ticketRegression.slope > 0 ? '↗️' : ticketRegression.slope < 0 ? '↘️' : '➡️'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Slope: {ticketRegression.slope}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Year-over-Year and Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Year-Over-Year Comparison
            </CardTitle>
            <CardDescription>
              Ticket and revenue growth compared to previous year
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearOverYearData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }} 
                  formatter={(value, name) => {
                    if (name === 'current_year_tickets' || name === 'previous_year_tickets') {
                      return [value, 'Tickets'];
                    }
                    if (name === 'current_year_revenue' || name === 'previous_year_revenue') {
                      return [`KSh ${value.toLocaleString()}`, 'Revenue'];
                    }
                    if (name === 'ticket_growth_rate' || name === 'revenue_growth_rate') {
                      return [`${value}%`, 'Growth Rate'];
                    }
                    return [value, name];
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="current_year_tickets" 
                  fill="hsl(var(--primary))" 
                  name="Current Year Tickets" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  yAxisId="left"
                  dataKey="previous_year_tickets" 
                  fill="hsl(var(--secondary))" 
                  name="Previous Year Tickets" 
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
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Forecast Analysis
            </CardTitle>
            <CardDescription>
              Predicted ticket volumes and revenue for next 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" />
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
                    if (name === 'confidence_lower' || name === 'confidence_upper') return [value, 'Confidence Interval'];
                    return [value, name];
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="confidence_lower" 
                  stroke="none" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.1} 
                  name="Lower Confidence"
                />
                <Area 
                  type="monotone" 
                  dataKey="confidence_upper" 
                  stroke="none" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.1} 
                  name="Upper Confidence"
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
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2 hover:shadow-md transition-all" 
              onClick={handleNewOrder}
            >
              <div className="p-2 bg-purple-500/10 rounded-full">
                <ShoppingCart className="h-5 w-5 text-purple-500" />
              </div>
              <span>New Order</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}