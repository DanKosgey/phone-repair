"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Wrench, Search, Phone, UserCircle, Info, Smartphone, Settings, Hammer } from "lucide-react"
import { ticketsDb } from "@/lib/db/tickets"
import { useRouter } from "next/navigation"

export default function EnhancedTrackTicket() {
  const [customerName, setCustomerName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [ticketsData, setTicketsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize particles for background effect
  useEffect(() => {
    const particlesContainer = document.getElementById('track-particles')
    if (particlesContainer) {
      // Clear any existing particles
      particlesContainer.innerHTML = ''
      
      // Create new particles
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = Math.random() * 100 + '%'
        particle.style.animationDelay = Math.random() * 15 + 's'
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's'
        particlesContainer.appendChild(particle)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName || !phoneNumber) {
      setError("Please enter both your name and phone number")
      return
    }

    // Basic validation for phone number format
    // Allow common phone number formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
    const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
    if (!phoneRegex.test(phoneNumber)) {
      setError("Please enter a valid phone number (e.g., (555) 123-4567 or 555-123-4567)")
      return
    }

    // Basic validation for customer name (at least 2 characters)
    if (customerName.trim().length < 2) {
      setError("Please enter a valid name (at least 2 characters)")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch tickets data from the database by phone number only (name is for display only)
      const data = await ticketsDb.getByPhoneNumber(phoneNumber.trim())
      
      if (data && data.length > 0) {
        setTicketsData(data)
      } else {
        setError("No repair tickets found for the provided phone number.")
      }
    } catch (error: any) {
      console.error("Error fetching tickets:", error)
      setError("Failed to fetch ticket information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactSupport = () => {
    // Redirect to contact page with customer details
    router.push(`/contact?name=${encodeURIComponent(customerName)}&phone=${encodeURIComponent(phoneNumber)}`)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500 text-white'
      case 'in progress': 
      case 'repairing': 
      case 'quality_check': 
      case 'diagnosing': return 'bg-blue-500 text-white'
      case 'pending': 
      case 'received': 
      case 'awaiting_parts': return 'bg-yellow-500 text-gray-900'
      case 'ready': return 'bg-purple-500 text-white'
      case 'cancelled': return 'bg-red-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="particles" id="track-particles"></div>
      
      {/* Spinning Phone Animation with Crack and Repair Elements */}
      <div className="phone-container">
        <div className="phone-3d">
          <div className="phone-screen">
            {/* Phone Crack */}
            <div className="phone-crack">
              <div className="crack-line"></div>
              <div className="crack-line"></div>
              <div className="crack-line"></div>
            </div>
            
            <div className="screen-content">
              <div className="status-bar">
                <span>9:41</span>
                <span>📶 🔋</span>
              </div>
              <div className="repair-status">
                🔧 Repair In Progress
              </div>
              <div className="app-grid">
                <div className="app-icon">📱</div>
                <div className="app-icon">⚙️</div>
                <div className="app-icon">📍</div>
                <div className="app-icon">💬</div>
                <div className="app-icon">🛒</div>
                <div className="app-icon">📊</div>
                <div className="app-icon">🔔</div>
                <div className="app-icon">⭐</div>
              </div>
            </div>
            <div className="screen-glow"></div>
          </div>
        </div>
        
        {/* Repair Shop Tools */}
        <div className="repair-tools">
          <div className="tool">🔧</div>
          <div className="tool">⚙️</div>
          <div className="tool">📱</div>
        </div>
        
        {/* Soldering Iron and Sparks */}
        <div className="soldering-iron"></div>
        <div className="spark"></div>
        <div className="spark"></div>
        <div className="spark"></div>
        <div className="spark"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-cyan-300">
            Track Your Repairs
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Check the status of your device repair in real-time. Just enter your details below.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          {/* Made the card background transparent to view the phone animation behind it */}
          <Card className="bg-transparent border border-blue-500/30 shadow-2xl shadow-blue-500/20 rounded-2xl overflow-hidden backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 pb-8 pt-6 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-500/20">
                  <Search className="h-8 w-8 text-blue-300" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-blue-300">Find Your Repair</CardTitle>
              <CardDescription className="text-center text-blue-200">
                Enter your information to track your device repair status
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 py-6 backdrop-blur-sm">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-blue-200 flex items-center gap-2">
                    <UserCircle className="h-4 w-4" />
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="customerName"
                      placeholder="e.g., John Smith"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="border-blue-500/30 focus:border-blue-500 focus:ring-blue-500 bg-gray-700/40 text-white pl-10 py-6 text-lg rounded-xl"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-blue-200 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Input
                      id="phoneNumber"
                      placeholder="e.g., (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      className="border-blue-500/30 focus:border-blue-500 focus:ring-blue-500 bg-gray-700/40 text-white pl-10 py-6 text-lg rounded-xl"
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                  </div>
                </div>
                {error && (
                  <div className="text-red-300 text-sm bg-red-900/40 p-4 rounded-xl border border-red-500/30">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">Error:</span> {error}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pb-8 backdrop-blur-sm">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Searching...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Track Repairs
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {ticketsData.length > 0 && (
            <div className="mt-10 space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-blue-300 mb-2">Your Repair Tickets</h2>
                <p className="text-blue-200">We found {ticketsData.length} repair ticket(s) matching your information</p>
              </div>
              
              {ticketsData.map((ticketData) => (
                <Card key={ticketData.id} className="bg-gray-800/60 backdrop-blur-lg border-2 border-blue-400 rounded-2xl overflow-hidden hover:border-blue-300 transition-all duration-300 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-blue-800/40 to-indigo-800/40 pb-6 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-3xl font-bold text-white">Repair Status</CardTitle>
                        <CardDescription className="text-blue-200 mt-1 text-lg">
                          Customer: {ticketData.customer_name}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(ticketData.status)} px-6 py-3 text-xl font-bold rounded-full shadow-lg`}>
                        {ticketData.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start space-x-4 p-6 bg-gray-700/40 rounded-xl border border-blue-500/30">
                        <div className="p-3 rounded-lg bg-blue-500/20">
                          <Smartphone className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-300 uppercase tracking-wider font-bold">Device Information</p>
                          <p className="font-bold text-2xl text-white mt-1">{ticketData.device_brand} {ticketData.device_model}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-6 bg-gray-700/40 rounded-xl border border-blue-500/30">
                        <div className="p-3 rounded-lg bg-blue-500/20">
                          <Info className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-300 uppercase tracking-wider font-bold">Issue Description</p>
                          <p className="font-bold text-xl text-white mt-1">{ticketData.issue_description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-6 bg-gray-700/40 rounded-xl border border-blue-500/30">
                        <div className="p-3 rounded-lg bg-blue-500/20">
                          <Calendar className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-300 uppercase tracking-wider font-bold">Created Date</p>
                          <p className="font-bold text-2xl text-white mt-1">
                            {new Date(ticketData.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4 p-6 bg-gray-700/40 rounded-xl border border-blue-500/30">
                        <div className="p-3 rounded-lg bg-blue-500/20">
                          <Clock className="h-8 w-8 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-300 uppercase tracking-wider font-bold">Estimated Completion</p>
                          <p className="font-bold text-2xl text-white mt-1">
                            {ticketData.estimated_completion 
                              ? new Date(ticketData.estimated_completion).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })
                              : 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {ticketData.notes && (
                      <div className="p-6 bg-gray-700/40 rounded-xl border border-blue-500/30">
                        <p className="text-sm text-blue-300 uppercase tracking-wider font-bold mb-3">Repair Notes</p>
                        <p className="text-white text-lg">{ticketData.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              <Card className="bg-gray-800/60 backdrop-blur-lg border border-blue-500/30 rounded-2xl overflow-hidden mt-6">
                <CardFooter className="py-6">
                  <Button 
                    variant="outline" 
                    className="w-full border-blue-500 text-blue-300 hover:bg-blue-900/40 py-6 text-lg rounded-xl"
                    onClick={handleContactSupport}
                  >
                    Contact Support
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}