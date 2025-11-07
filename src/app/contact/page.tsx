"use client";

import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getBusinessConfig } from '@/lib/config-service'
import { useEffect, useState } from 'react'
import { notificationsDb } from '@/lib/db/notifications'
import { useToast } from "@/hooks/use-toast"
import { useContactInfo } from '@/hooks/use-contact-info'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ticketsDb } from '@/lib/db/tickets'

export default function ContactPage() {
  const [businessConfig, setBusinessConfig] = useState(null);
  const contactInfo = useContactInfo();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerTickets, setCustomerTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isCustomerData, setIsCustomerData] = useState(false); // Flag to track if data came from tracking
  const { toast } = useToast();

  useEffect(() => {
    // Load business configuration
    const loadBusinessConfig = async () => {
      try {
        const config = await getBusinessConfig();
        setBusinessConfig(config);
      } catch (error) {
        console.error('Error loading business config:', error);
      }
    };
    
    loadBusinessConfig();
    
    // Pre-populate form with customer details from URL params
    const name = searchParams.get('name') || '';
    const phone = searchParams.get('phone') || '';
    
    if (name || phone) {
      setFormData(prev => ({
        ...prev,
        name,
        phone
      }));
      setIsCustomerData(true);
      
      // If we have phone number, fetch customer's repair history
      if (phone) {
        fetchCustomerTickets(phone);
      }
    }
  }, [searchParams]);

  const fetchCustomerTickets = async (phoneNumber: string) => {
    setIsLoadingTickets(true);
    try {
      const tickets = await ticketsDb.getByPhoneNumber(phoneNumber);
      setCustomerTickets(tickets);
    } catch (error) {
      console.error('Error fetching customer tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load repair history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    
    // Prevent changing name and phone if they came from tracking
    if ((id === 'name' || id === 'phone') && isCustomerData) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create notification in database
      await notificationsDb.create({
        sender_name: formData.name,
        sender_email: formData.email,
        sender_phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon.",
      });
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'ready': return 'bg-blue-100 text-blue-800'
      case 'repairing': return 'bg-purple-100 text-purple-800'
      case 'diagnosing': return 'bg-yellow-100 text-yellow-800'
      case 'received': return 'bg-gray-100 text-gray-800'
      case 'awaiting_parts': return 'bg-orange-100 text-orange-800'
      case 'quality_check': return 'bg-indigo-100 text-indigo-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Your name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  readOnly={isCustomerData}
                  className={isCustomerData ? "bg-gray-100 cursor-not-allowed" : ""}
                />
                {isCustomerData && (
                  <p className="text-sm text-muted-foreground mt-1">This field is pre-filled from your repair tracking and cannot be edited.</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Your phone number" 
                  value={formData.phone}
                  onChange={handleInputChange}
                  readOnly={isCustomerData}
                  className={isCustomerData ? "bg-gray-100 cursor-not-allowed" : ""}
                />
                {isCustomerData && (
                  <p className="text-sm text-muted-foreground mt-1">This field is pre-filled from your repair tracking and cannot be edited.</p>
                )}
              </div>
              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input 
                  id="subject" 
                  placeholder="How can we help?" 
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea 
                  id="message" 
                  placeholder="Your message" 
                  rows={4} 
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p>{contactInfo.phone}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p>{contactInfo.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Hours</h3>
                  <p>{contactInfo.hours}</p>
                </div>
                {businessConfig && businessConfig.businessAddress && (
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p>{businessConfig.businessAddress}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Customer Repair History Section */}
            {formData.phone && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Your Repair History</h2>
                {isLoadingTickets ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : customerTickets.length > 0 ? (
                  <div className="space-y-4">
                    {customerTickets.map((ticket) => (
                      <Card key={ticket.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{ticket.ticket_number}</CardTitle>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <CardDescription>
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium">{ticket.device_brand} {ticket.device_model}</p>
                          <p className="text-sm text-muted-foreground mt-1">{ticket.issue_description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No repair history found for this phone number.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}