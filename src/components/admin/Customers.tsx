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
  Trash2,
  ArrowUpDown,
  Users,
  DollarSign,
  TrendingUp,
  UserPlus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Database } from "../../../types/database.types"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Use the customers DB module
import { customersDb } from '@/lib/db/customers'
import { dashboardDb } from '@/lib/db/dashboard'
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerSummary = {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  last_activity: string | null
  total_lifetime_value: number | null
  total_orders: number | null
  total_tickets: number | null
  total_spent_on_products: number | null
  total_spent_on_repairs: number | null
}

export default function AdminCustomers() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [customerSummary, setCustomerSummary] = useState<CustomerSummary[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{key: string, direction: string} | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        redirect('/login')
      }
    }
  }, [user, role, authLoading])

  useEffect(() => {
    fetchCustomers()
    fetchCustomerSummary()
  }, [])

  useEffect(() => {
    let result = [...customers]
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(customer => 
        customer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.name && customer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      // For now, all customers are considered active
      // In a real implementation, you might have different status filters
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
    
    setFilteredCustomers(result)
  }, [searchTerm, statusFilter, customers, sortConfig])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const data = await customersDb.getAll()
      setCustomers(data || [])
      setFilteredCustomers(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch customers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomerSummary = async () => {
    try {
      const data = await dashboardDb.getCustomerSummary()
      setCustomerSummary(data || [])
    } catch (error: any) {
      console.error("Failed to fetch customer summary:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
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

  const handleViewCustomer = (customerId: string) => {
    // Navigate to customer details page (would need to be implemented)
    // router.push(`/admin/customers/${customerId}`)
  }

  const handleEditCustomer = (customerId: string) => {
    // Navigate to edit customer page (would need to be implemented)
    // router.push(`/admin/customers/${customerId}/edit`)
  }

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      await customersDb.delete(customerId)
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      })
      // Refresh the customers list
      fetchCustomers()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  // Calculate summary statistics
  const totalCustomers = customers.length
  const totalLifetimeValue = customerSummary.reduce((sum, customer) => sum + (customer.total_lifetime_value || 0), 0)
  const avgLifetimeValue = totalCustomers > 0 ? totalLifetimeValue / totalCustomers : 0

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
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage all customers
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lifetime Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">
              Combined customer value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Customer Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgLifetimeValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per customer average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
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
                Customer ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Email
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Phone
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
                Lifetime Value
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('id')}>
                Customer ID {getSortIcon('id')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>
                Name {getSortIcon('name')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('email')}>
                Email {getSortIcon('email')}
              </TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('created_at')}>
                Joined {getSortIcon('created_at')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => {
                // Find customer summary data
                const summary = customerSummary.find(c => c.id === customer.id)
                return (
                <TableRow key={customer.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor('active')} cursor-pointer transition-colors`}>
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewCustomer(customer.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditCustomer(customer.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCustomer(customer.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )})
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}