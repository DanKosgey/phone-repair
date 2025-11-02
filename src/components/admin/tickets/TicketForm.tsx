"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ticketsDb } from "@/lib/db/tickets"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { generateCSRFToken, storeCSRFToken, validateCSRFToken } from '@/lib/utils/csrf'

export default function TicketForm() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deviceType, setDeviceType] = useState("")
  const [deviceBrand, setDeviceBrand] = useState("")
  const [deviceModel, setDeviceModel] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    setCsrfToken(token);
    
    return () => {
      // Clean up CSRF token on unmount
      // Note: We don't remove it here because the form might still be submitting
    };
  }, []);

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        router.push('/login')
      }
    }
  }, [user, role, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate CSRF token
      if (!csrfToken || !validateCSRFToken(csrfToken)) {
        throw new Error('Invalid request. Please refresh the page and try again.');
      }

      // Validate form inputs
      if (!customerName || customerName.trim().length < 2) {
        throw new Error('Customer name must be at least 2 characters long');
      }

      if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
        throw new Error('Please enter a valid email address');
      }

      if (!customerPhone || !/^\+?[\d\s\-\(\)]{10,15}$/.test(customerPhone)) {
        throw new Error('Please enter a valid phone number');
      }

      if (!deviceType || deviceType.trim().length < 2) {
        throw new Error('Device type must be at least 2 characters long');
      }

      if (!deviceBrand || deviceBrand.trim().length < 2) {
        throw new Error('Device brand must be at least 2 characters long');
      }

      if (!deviceModel || deviceModel.trim().length < 1) {
        throw new Error('Device model is required');
      }

      if (!issueDescription || issueDescription.trim().length < 10) {
        throw new Error('Issue description must be at least 10 characters long');
      }

      // Validate estimated cost if provided
      if (estimatedCost && (isNaN(Number(estimatedCost)) || Number(estimatedCost) <= 0)) {
        throw new Error('Estimated cost must be a positive number');
      }

      const supabase = getSupabaseBrowserClient()
      // Use authenticated user's ID for RLS compliance

      // Debug authentication state
      logger.log('TicketForm: Auth state', { 
        userId: user?.id ? '[REDACTED]' : null, 
        hasRole: !!role,
        authLoading,
        isAuthenticated: !!user,
        isAdmin: role === 'admin'
      });

      // Check if user is properly authenticated
      if (!user || role !== 'admin') {
        throw new Error('User not properly authenticated as admin');
      }

      // Additional check: Verify the user has admin role in the database
      logger.log('TicketForm: Verifying user has admin role in database');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        logger.error('TicketForm: Error fetching user profile', profileError.message);
        throw new Error('Failed to verify user permissions');
      }

      if (profileData?.role !== 'admin') {
        logger.error('TicketForm: User does not have admin role in database');
        throw new Error('User does not have permission to create tickets');
      }

      logger.log('TicketForm: User verified as admin in database');

      // Force refresh the session to ensure we have the latest auth token with role claim
      logger.log('TicketForm: Refreshing session to ensure role claim is set');
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        logger.error('TicketForm: Error refreshing session', refreshError.message);
        throw new Error('Failed to refresh authentication session');
      }
      
      logger.log('TicketForm: Refreshed session');

      // Verify that we have a valid session with admin role
      if (!refreshedSession || !refreshedSession.user) {
        throw new Error('No valid session found after refresh');
      }

      // Log the JWT token to see if it contains the role claim
      logger.log('TicketForm: JWT token refreshed');
      
      // Decode the JWT token to see its contents
      try {
        const tokenParts = refreshedSession.access_token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        logger.log('TicketForm: Decoded JWT payload keys', Object.keys(payload));
      } catch (decodeError: any) {
        logger.error('TicketForm: Error decoding JWT', decodeError.message);
      }

      // Generate ticket number
      const ticketNumber = `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

      // Create ticket directly using the Supabase client
      logger.log('TicketForm: Creating ticket with user ID', user.id ? '[REDACTED]' : null);
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id, // Use authenticated user's ID
          ticket_number: ticketNumber,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim(),
          device_type: deviceType.trim(),
          device_brand: deviceBrand.trim(),
          device_model: deviceModel.trim(),
          issue_description: issueDescription.trim(),
          estimated_cost: estimatedCost ? Number(estimatedCost) : null,
          status: 'received',
          priority: 'normal'
        })
        .select()
        .single();

      if (error) {
        logger.error('TicketForm: Error creating ticket', error.message);
        throw new Error(`Failed to create ticket: ${error.message}`);
      }

      logger.log('TicketForm: Ticket created successfully');
      
      // Clean up CSRF token after successful submission
      // Note: We don't remove it immediately because the redirect might need it
      setTimeout(() => {
        // Remove CSRF token after a short delay to allow for any async operations
      }, 1000);
      
      toast({
        title: "Success",
        description: "Ticket created successfully",
      })
      
      // Redirect to the newly created ticket's view page
      if (data && data.id) {
        router.push(`/admin/tickets/${data.id}`)
      } else {
        // Fallback to tickets list if we don't have the ticket ID
        router.push("/admin/tickets")
      }
    } catch (error: any) {
      logger.error('TicketForm: Error creating ticket', error.message);
      // Provide user-friendly error messages
      let errorMessage = "Failed to create ticket. Please try again.";
      
      if (error.message) {
        // Don't expose sensitive technical details to the user
        if (error.message.includes('row-level security')) {
          errorMessage = "You don't have permission to create tickets. Please contact your administrator.";
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Your session has expired. Please sign in again.";
        } else if (error.message.includes('Network Error')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.length < 100) {
          // Only show short, user-friendly error messages
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-3xl font-bold">New Repair Ticket</h1>
          <p className="text-muted-foreground">
            Create a new repair ticket for a customer
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Hidden CSRF token field */}
        <input type="hidden" name="csrf_token" value={csrfToken || ''} />
        
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
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
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
              <Label htmlFor="estimatedCost">Estimated Cost (KSh)</Label>
              <Input
                id="estimatedCost"
                type="number"
                placeholder="e.g., 5000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="issueDescription">Issue Description</Label>
              <Textarea
                id="issueDescription"
                placeholder="Describe the issue the device is experiencing..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardFooter className="flex justify-end gap-4">
            <Link href="/admin/tickets">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Creating..." : "Create Ticket"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}