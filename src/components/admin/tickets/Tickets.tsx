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
  ArrowUpDown
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ticketsDb } from "@/lib/db/tickets"
import { dashboardDb } from "@/lib/db/dashboard"
import { Database } from "../../../../types/database.types"
import { useAuth } from '@/contexts/auth-context'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TicketStatusDistribution = {
  status: string
  count: number
  percentage: number
}

export default function Tickets() {
  const { user, isLoading: authLoading } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{key: string, direction: string} | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusDistribution, setStatusDistribution] = useState<TicketStatusDistribution[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      }
    }
  }, [user, authLoading, router])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log('Tickets: Timeout reached, forcing loading to complete');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    fetchTickets()
    fetchStatusDistribution()
  }, [])

  useEffect(() => {
    let result = [...tickets]
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(ticket => 
        ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.device_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.device_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issue_description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(ticket => ticket.status === statusFilter)
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
    
    setFilteredTickets(result)
  }, [searchTerm, statusFilter, tickets, sortConfig])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const data = await ticketsDb.getAll()
      setTickets(data)
      setFilteredTickets(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch tickets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStatusDistribution = async () => {
    try {
      const data = await dashboardDb.getTicketStatusDistribution()
      setStatusDistribution(data)
    } catch (error: any) {
      console.error("Failed to fetch status distribution:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'ready': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'repairing': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'diagnosing': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'received': return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      case 'awaiting_parts': return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case 'quality_check': return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
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

  const handleViewTicket = (ticketId: string) => {
    // Navigate to ticket details page
    router.push(`/admin/tickets/${ticketId}`)
  }

  const handleEditTicket = (ticketId: string) => {
    // Navigate to edit ticket page
    router.push(`/admin/tickets/${ticketId}/edit`)
  }

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await ticketsDb.delete(ticketId)
      toast({
        title: "Success",
        description: "Ticket deleted successfully",
      })
      // Refresh the tickets list
      fetchTickets()
      fetchStatusDistribution()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
        variant: "destructive",
      })
    }
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
          <h1 className="text-3xl font-bold">Repair Tickets</h1>
          <p className="text-muted-foreground">
            Manage all repair tickets and their status
          </p>
        </div>
        <Link href="/admin/tickets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusDistribution.map((item) => (
          <Card key={item.status} className="hover:shadow-md transition-shadow cursor-pointer" 
                onClick={() => setStatusFilter(item.status)}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium capitalize">
                {item.status.replace('_', ' ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <p className="text-xs text-muted-foreground">
                {item.percentage.toFixed(1)}% of total tickets
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
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
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="diagnosing">Diagnosing</SelectItem>
              <SelectItem value="awaiting_parts">Awaiting Parts</SelectItem>
              <SelectItem value="repairing">Repairing</SelectItem>
              <SelectItem value="quality_check">Quality Check</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
                Ticket ID
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
                Device
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Issue
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

      {/* Tickets Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => requestSort('ticket_number')}>
                Ticket ID {getSortIcon('ticket_number')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('customer_name')}>
                Customer {getSortIcon('customer_name')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('device_brand')}>
                Device {getSortIcon('device_brand')}
              </TableHead>
              <TableHead>Issue</TableHead>
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
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No tickets found
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                  <TableCell>{ticket.customer_name}</TableCell>
                  <TableCell>{ticket.device_brand} {ticket.device_model}</TableCell>
                  <TableCell className="max-w-xs truncate" title={ticket.issue_description}>
                    {ticket.issue_description}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(ticket.status)} cursor-pointer transition-colors`}
                          onClick={() => setStatusFilter(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleViewTicket(ticket.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditTicket(ticket.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTicket(ticket.id)}>
                        <Trash2 className="h-4 w-4" />
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