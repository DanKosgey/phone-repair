"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  Phone, 
  Mail, 
  Smartphone, 
  AlertCircle, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ticketsDb } from "@/lib/db/tickets"
import { Database } from "../../../../../types/database.types"
import { useAuth } from '@/contexts/auth-context'

type Ticket = Database['public']['Tables']['tickets']['Row']

export default function ViewTicket() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [ticketId, setTicketId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const hasRedirected = useRef(false)

  // Unwrap the params promise for Next.js 16
  useEffect(() => {
    const unwrapParams = async () => {
      if (params && typeof params === 'object' && 'id' in params) {
        const unwrappedParams = await Promise.resolve(params)
        setTicketId(unwrappedParams.id as string)
      }
    }
    
    unwrapParams()
  }, [params])

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !hasRedirected.current) {
      if (!user || role !== 'admin') {
        hasRedirected.current = true
        router.push('/login')
      }
    }
  }, [user, role, authLoading, router])

  useEffect(() => {
    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      setIsLoading(true)
      const data = await ticketsDb.getById(ticketId as string)
      console.log('Fetched ticket data:', data); // Debug log
      if (data && data.device_photos) {
        console.log('Device photos:', data.device_photos); // Debug log
      }
      setTicket(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch ticket",
        variant: "destructive",
      })
      router.push('/admin/tickets')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'ready': return 'bg-blue-100 text-blue-800'
      case 'repairing': return 'bg-purple-100 text-purple-800'
      case 'diagnosing': return 'bg-yellow-100 text-yellow-800'
      case 'awaiting_parts': return 'bg-orange-100 text-orange-800'
      case 'quality_check': return 'bg-indigo-100 text-indigo-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'partial': return 'bg-yellow-100 text-yellow-800'
      case 'unpaid': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ticket Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested ticket could not be found.</p>
        <Button onClick={() => router.push('/admin/tickets')}>
          Back to Tickets
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tickets">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ticket Details</h1>
          <p className="text-muted-foreground">
            View and manage repair ticket information
          </p>
        </div>
        <div className="ml-auto">
          <Link href={`/admin/tickets/${ticket.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Ticket
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Ticket Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{ticket.ticket_number}</CardTitle>
                  <CardDescription>
                    Created on {new Date(ticket.created_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Name:</span>
                    <span>{ticket.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.customer_email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.customer_phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Device Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.device_brand} {ticket.device_model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <span>{ticket.device_type}</span>
                  </div>
                  {ticket.device_imei && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">IMEI:</span>
                      <span>{ticket.device_imei}</span>
                    </div>
                  )}
                </div>
              </div>

              {ticket.device_photos && ticket.device_photos.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Device Photos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {ticket.device_photos.map((photoUrl, index) => (
                        <div key={index} className="aspect-square">
                          <img 
                            src={photoUrl} 
                            alt={`Device photo ${index + 1}`} 
                            className="w-full h-full object-cover rounded-lg border"
                            onError={(e) => {
                              console.error('Error loading image:', photoUrl);
                              // Set a fallback image or hide the broken image
                              e.currentTarget.src = '/placeholder-image.png'; // You might want to add a placeholder image
                              // Or hide the image entirely:
                              // e.currentTarget.style.display = 'none';
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', photoUrl);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-2">Issue Description</h3>
                <p className="text-muted-foreground">
                  {ticket.issue_description ? ticket.issue_description : 'No description provided'}
                </p>
                {/* Debug: Show the raw issue description */}
                {/* <p className="text-xs text-gray-500 mt-2">Raw: {ticket.issue_description}</p> */}
              </div>

              {(ticket.notes || ticket.customer_notes) && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Notes</h3>
                    {ticket.notes && (
                      <div className="mb-3">
                        <h4 className="font-medium mb-1">Internal Notes</h4>
                        <p className="text-muted-foreground">{ticket.notes}</p>
                      </div>
                    )}
                    {ticket.customer_notes && (
                      <div>
                        <h4 className="font-medium mb-1">Customer Notes</h4>
                        <p className="text-muted-foreground">{ticket.customer_notes}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Cost and Timeline Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cost Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Estimated Cost:</span>
                <span className="font-medium">
                  {ticket.estimated_cost ? `KSh ${ticket.estimated_cost.toFixed(2)}` : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Actual Cost:</span>
                <span className="font-medium">
                  {ticket.actual_cost ? `KSh ${ticket.actual_cost.toFixed(2)}` : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Deposit Paid:</span>
                <span className="font-medium">
                  {ticket.deposit_paid ? `KSh ${ticket.deposit_paid.toFixed(2)}` : 'None'}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <Badge className={getPaymentStatusColor(ticket.payment_status || 'unpaid')}>
                  {ticket.payment_status || 'unpaid'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(ticket.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {ticket.estimated_completion && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Estimated Completion</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.estimated_completion).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {ticket.actual_completion_date && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Actual Completion</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(ticket.actual_completion_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}