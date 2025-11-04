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
  PieChart as PieChartIcon, 
  Package, 
  Users, 
  Clock, 
  Eye, 
  Wrench, 
  Plus, 
  AlertCircle 
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import { dashboardDb, Timeframe } from '@/lib/db/dashboard'
import { ticketsDb } from '@/lib/db/tickets'
import { productsDb } from '@/lib/db/products'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

// Types
type StatCard = {
  title: string
  value: string
  change: string
  icon: any
  color: string
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

type TicketStatus = {
  status: string
  count: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

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
    { title: "Avg Tickets per Customer", value: "0", change: "+0% from last month", icon: TrendingUp, color: "bg-purple-500" },
  ])
  
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([])
  const [ticketStatusData, setTicketStatusData] = useState<TicketStatus[]>([])
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [dataLoading, setDataLoading] = useState({
    stats: true,
    tickets: true,
    status: true
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
      
      // Fetch recent tickets
      await fetchRecentTickets()
      
      // Fetch ticket status for simple insight
      await fetchTicketStatus()
      
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
      
      // Calculate average tickets per customer
      const avgTicketsPerCustomer = data.total_customers && data.total_customers > 0 
        ? (data.tickets_completed || 0) / data.total_customers 
        : 0
      
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
        { 
          title: "Avg Tickets per Customer", 
          value: avgTicketsPerCustomer.toFixed(1), 
          change: "+0% from last month", 
          icon: TrendingUp, 
          color: "bg-purple-500" 
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

  const fetchTicketStatus = async () => {
    try {
      setDataLoading(prev => ({ ...prev, status: true }))
      const statusData = await dashboardDb.getTicketStatusDistribution()
      const transformed = statusData.map(item => ({
        status: item.status,
        count: item.count
      }))
      setTicketStatusData(transformed)
    } catch (error) {
      console.error("Failed to fetch ticket status:", error)
      toast({
        title: "Error",
        description: "Failed to fetch ticket status data",
        variant: "destructive",
      })
    } finally {
      setDataLoading(prev => ({ ...prev, status: false }))
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
    localStorage.setItem('dashboardTimeframe', newTimeframe);
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor and manage your shop operations</p>
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

        {/* Quick Actions at Top */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Add new tickets, products, or customers quickly
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              onClick={() => router.push('/analytics')}
            >
              <div className="p-2 bg-purple-500/10 rounded-full">
                <PieChartIcon className="h-5 w-5 text-purple-500" />
              </div>
              <span>View Analytics</span>
            </Button>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
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

        {/* Simple Data Insight: Ticket Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Ticket Status Overview
              </CardTitle>
              <CardDescription>
                Quick insight into current ticket statuses
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              {ticketStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {ticketStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No status data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tickets */}
          <Card className="shadow-md hover:shadow-lg transition-shadow">
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
        </div>
      </div>
    </div>
  )
}