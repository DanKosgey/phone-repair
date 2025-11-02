"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Save, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ticketsDb } from "@/lib/db/tickets"
import { Database } from "../../../../../types/database.types"
import { useAuth } from '@/contexts/auth-context'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TicketUpdate = Database['public']['Tables']['tickets']['Update']

export default function EditTicket() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deviceType, setDeviceType] = useState("")
  const [deviceBrand, setDeviceBrand] = useState("")
  const [deviceModel, setDeviceModel] = useState("")
  const [deviceImei, setDeviceImei] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [actualCost, setActualCost] = useState("")
  const [depositPaid, setDepositPaid] = useState("")
  const [status, setStatus] = useState("")
  const [priority, setPriority] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [notes, setNotes] = useState("")
  const [customerNotes, setCustomerNotes] = useState("")
  const router = useRouter()
  const { id } = useParams()
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
    if (id && typeof id === 'string') {
      fetchTicket()
    }
  }, [id])

  const fetchTicket = async () => {
    try {
      setIsLoading(true)
      const data = await ticketsDb.getById(id as string)
      setTicket(data)
      
      // Populate form fields with ticket data
      if (data) {
        setCustomerName(data.customer_name || "")
        setCustomerEmail(data.customer_email || "")
        setCustomerPhone(data.customer_phone || "")
        setDeviceType(data.device_type || "")
        setDeviceBrand(data.device_brand || "")
        setDeviceModel(data.device_model || "")
        setDeviceImei(data.device_imei || "")
        setIssueDescription(data.issue_description || "")
        setEstimatedCost(data.estimated_cost?.toString() || "")
        setActualCost(data.actual_cost?.toString() || "")
        setDepositPaid(data.deposit_paid?.toString() || "")
        setStatus(data.status || "")
        setPriority(data.priority || "")
        setPaymentStatus(data.payment_status || "")
        setNotes(data.notes || "")
        setCustomerNotes(data.customer_notes || "")
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form inputs
      if (!customerName || customerName.trim().length < 2) {
        throw new Error('Customer name must be at least 2 characters long')
      }

      if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        throw new Error('Please enter a valid email address')
      }

      if (customerPhone && !/^\+?[\d\s\-\(\)]{10,15}$/.test(customerPhone)) {
        throw new Error('Please enter a valid phone number')
      }

      if (!deviceType || deviceType.trim().length < 2) {
        throw new Error('Device type must be at least 2 characters long')
      }

      if (!deviceBrand || deviceBrand.trim().length < 2) {
        throw new Error('Device brand must be at least 2 characters long')
      }

      if (!deviceModel || deviceModel.trim().length < 1) {
        throw new Error('Device model is required')
      }

      if (!issueDescription || issueDescription.trim().length < 10) {
        throw new Error('Issue description must be at least 10 characters long')
      }

      // Validate numeric fields if provided
      if (estimatedCost && (isNaN(Number(estimatedCost)) || Number(estimatedCost) <= 0)) {
        throw new Error('Estimated cost must be a positive number')
      }

      if (actualCost && (isNaN(Number(actualCost)) || Number(actualCost) < 0)) {
        throw new Error('Actual cost must be a non-negative number')
      }

      if (depositPaid && (isNaN(Number(depositPaid)) || Number(depositPaid) < 0)) {
        throw new Error('Deposit paid must be a non-negative number')
      }

      // Prepare update data
      const updateData: TicketUpdate = {
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || null,
        customer_phone: customerPhone.trim() || null,
        device_type: deviceType.trim(),
        device_brand: deviceBrand.trim(),
        device_model: deviceModel.trim(),
        device_imei: deviceImei.trim() || null,
        issue_description: issueDescription.trim(),
        estimated_cost: estimatedCost ? Number(estimatedCost) : null,
        actual_cost: actualCost ? Number(actualCost) : null,
        deposit_paid: depositPaid ? Number(depositPaid) : null,
        status: status as any,
        priority: priority as any,
        payment_status: paymentStatus as any,
        notes: notes.trim() || null,
        customer_notes: customerNotes.trim() || null,
        updated_at: new Date().toISOString()
      }

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof TicketUpdate] === undefined) {
          delete updateData[key as keyof TicketUpdate]
        }
      })

      // Update ticket
      await ticketsDb.update(id as string, updateData)
      
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      })
      
      // Redirect to ticket details page
      router.push(`/admin/tickets/${id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update ticket",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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
        <Link href={`/admin/tickets/${ticket.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Ticket</h1>
          <p className="text-muted-foreground">
            Update repair ticket information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Ticket Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Enter the customer's contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Information</CardTitle>
                <CardDescription>
                  Enter details about the device that needs repair
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deviceType">Device Type</Label>
                  <Input
                    id="deviceType"
                    placeholder="e.g., Smartphone, Tablet, Laptop"
                    value={deviceType}
                    onChange={(e) => setDeviceType(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceBrand">Device Brand</Label>
                  <Input
                    id="deviceBrand"
                    placeholder="e.g., Apple, Samsung, Huawei"
                    value={deviceBrand}
                    onChange={(e) => setDeviceBrand(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceModel">Device Model</Label>
                  <Input
                    id="deviceModel"
                    placeholder="e.g., iPhone 13 Pro, Samsung Galaxy S21"
                    value={deviceModel}
                    onChange={(e) => setDeviceModel(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deviceImei">Device IMEI</Label>
                  <Input
                    id="deviceImei"
                    placeholder="e.g., 123456789012345"
                    value={deviceImei}
                    onChange={(e) => setDeviceImei(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Description</CardTitle>
                <CardDescription>
                  Describe the issue the device is experiencing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe the issue the device is experiencing..."
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>
                  Add internal notes and customer-visible notes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notes for repair technicians..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerNotes">Customer Notes</Label>
                  <Textarea
                    id="customerNotes"
                    placeholder="Notes visible to customer..."
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with Status and Cost Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">Estimated Cost (KSh)</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    placeholder="e.g., 5000"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="actualCost">Actual Cost (KSh)</Label>
                  <Input
                    id="actualCost"
                    type="number"
                    placeholder="e.g., 4500"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depositPaid">Deposit Paid (KSh)</Label>
                  <Input
                    id="depositPaid"
                    type="number"
                    placeholder="e.g., 1000"
                    value={depositPaid}
                    onChange={(e) => setDepositPaid(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardFooter className="flex justify-end gap-4">
                <Link href={`/admin/tickets/${ticket.id}`}>
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}