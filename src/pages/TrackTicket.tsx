"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { ticketsDb } from "@/lib/db/tickets"
import { Search, AlertTriangle } from "lucide-react"
import { redirect } from "next/navigation"
import { getFeatureSettings } from "@/lib/feature-toggle"

export default function TrackTicket() {
  const [ticketNumber, setTicketNumber] = useState('')
  const [ticket, setTicket] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [featureEnabled, setFeatureEnabled] = useState(true)
  const { toast } = useToast()

  // Check if the tracking feature is enabled
  useState(() => {
    const checkFeatureEnabled = async () => {
      try {
        const settings = await getFeatureSettings()
        setFeatureEnabled(settings.enableTracking)
        
        // If feature is disabled, redirect to home
        if (!settings.enableTracking) {
          redirect('/')
        }
      } catch (error) {
        console.error('Error checking feature settings:', error)
        // Default to enabled if there's an error
        setFeatureEnabled(true)
      }
    }

    checkFeatureEnabled()
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ticketNumber.trim()) return

    try {
      setIsLoading(true)
      const data = await ticketsDb.getByTicketNumber(ticketNumber)
      setTicket(data)
      
      if (!data) {
        toast({
          title: "Ticket Not Found",
          description: "No ticket found with that ticket number",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch ticket information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If feature is disabled, show a message
  if (!featureEnabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Feature Not Available</h1>
          <p className="text-muted-foreground mb-6">
            The repair tracking feature is currently disabled. Please check back later.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Track Your Repair</h1>
            <p className="text-muted-foreground">
              Enter your ticket number to see real-time updates on your repair
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Find Your Ticket</CardTitle>
              <CardDescription>
                Enter your ticket number to track the status of your repair
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter ticket number (e.g., TKT-2024-001)"
                    className="pl-10"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={isLoading || !ticketNumber.trim()}>
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {ticket && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ticket Status</CardTitle>
                <CardDescription>
                  Ticket #{ticket.ticket_number}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Device Information</h3>
                    <p className="text-muted-foreground">{ticket.device_type} - {ticket.device_brand} {ticket.device_model}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Issue Description</h3>
                    <p className="text-muted-foreground">{ticket.issue_description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      ticket.status === 'completed' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">Created</h3>
                    <p className="text-muted-foreground">
                      {new Date(ticket.created_at).toLocaleDateString()} at {new Date(ticket.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {ticket.estimated_completion_date && (
                    <div>
                      <h3 className="font-semibold">Estimated Completion</h3>
                      <p className="text-muted-foreground">
                        {new Date(ticket.estimated_completion_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setTicket(null)}>
                  Search Again
                </Button>
                <Button>Contact Support</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}