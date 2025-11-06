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

export default function ContactPage() {
  const [businessConfig, setBusinessConfig] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    phone: "(555) 123-4567",
    email: "support@repairhub.com",
    hours: "Mon-Sat 9AM-6PM"
  });
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    // Load contact information
    if (typeof window !== 'undefined') {
      const storedContactInfo = localStorage.getItem('homepageContactInfo');
      if (storedContactInfo) {
        setContactInfo(JSON.parse(storedContactInfo));
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
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
          <div>
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
                />
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
                />
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
        </div>
      </main>
      <Footer />
    </div>
  )
}