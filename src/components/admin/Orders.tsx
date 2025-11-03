"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  BarChart, 
  BarChartHorizontal, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Truck, 
  CheckCircle,
  Package,
  DollarSign,
  ShoppingCart,
  ArrowUpDown
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Database } from "../../../types/database.types"
import { ordersDb } from '@/lib/db/orders'
import { dashboardDb } from '@/lib/db/dashboard'
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'

type Order = Database['public']['Tables']['orders']['Row']
type OrderStatus = Database['public']['Enums']['order_status']
type AdminDashboardMetrics = {
  orders_pending: number
  orders_shipped: number
  orders_delivered: number
  total_product_revenue: number
}

export default function AdminOrders() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{key: string, direction: string} | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardMetrics, setDashboardMetrics] = useState<AdminDashboardMetrics | null>(null)
  const { toast } = useToast()

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        redirect('/login')
      }
    }
  }, [user, role, authLoading])

  useEffect(() => {
    fetchOrders()
    fetchDashboardMetrics()
  }, [])

  useEffect(() => {
    let result = [...orders]
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter)
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    
    setFilteredOrders(result)
  }, [searchTerm, statusFilter, orders, sortConfig])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const data = await ordersDb.getAll()
      setOrders(data || [])
      setFilteredOrders(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch orders",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDashboardMetrics = async () => {
    try {
      const data = await dashboardDb.getAdminMetrics()
      setDashboardMetrics(data)
    } catch (error: any) {
      console.error("Failed to fetch dashboard metrics:", error)
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'shipped': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'delivered': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const requestSort = (key: string) => {
    let direction = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: string) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'KSh 0'
    return `KSh ${amount.toLocaleString()}`
  }

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersDb.update(orderId, { status: newStatus })
      
      toast({
        title: "Success",
        description: "Order status updated successfully",
      })
      
      // Refresh the orders list
      fetchOrders()
      fetchDashboardMetrics()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage all customer orders
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardMetrics ? formatCurrency(dashboardMetrics.total_product_revenue) : 'KSh 0'}
            </div>
            <p className="text-xs text-muted-foreground">
              From delivered orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardMetrics ? dashboardMetrics.orders_pending : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Orders awaiting processing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardMetrics ? dashboardMetrics.orders_shipped : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Orders in transit
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardMetrics ? dashboardMetrics.orders_delivered : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Table Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Order ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Customer
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Total
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Status
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Date
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('order_number')}>
                Order ID {getSortIcon('order_number')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('customer_name')}>
                Customer {getSortIcon('customer_name')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('total_amount')}>
                Total {getSortIcon('total_amount')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>
                Status {getSortIcon('status')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('created_at')}>
                Date {getSortIcon('created_at')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(order.status)} cursor-pointer transition-colors`}
                          onClick={() => setStatusFilter(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleUpdateStatus(
                          order.id, 
                          order.status === 'shipped' ? 'delivered' : 'shipped'
                        )}
                      >
                        {order.status === "shipped" ? 
                          <CheckCircle className="h-4 w-4" /> : 
                          <Truck className="h-4 w-4" />
                        }
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}