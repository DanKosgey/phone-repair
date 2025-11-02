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
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ticketsDb } from "@/lib/db/tickets"
import { Database } from "../../../types/database.types"
import { useAuth } from '@/contexts/auth-context'

type Ticket = Database['public']['Tables']['tickets']['Row']

export default function Tickets() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        router.push('/login')
      }
    }
  }, [user, role, authLoading, router])

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = tickets.filter(ticket => 
        ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.device_brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.device_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.issue_description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTickets(filtered)
    } else {
      setFilteredTickets(tickets)
    }
  }, [searchTerm, tickets])

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete ticket",
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
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
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                  <TableCell>{ticket.customer_name}</TableCell>
                  <TableCell>{ticket.device_brand} {ticket.device_model}</TableCell>
                  <TableCell>{ticket.issue_description}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(ticket.status)}>
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