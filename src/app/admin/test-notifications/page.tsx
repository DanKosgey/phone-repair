'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { notificationsDb } from '@/lib/db/notifications'

export default function TestNotificationsPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    sender_name: "Test User",
    sender_email: "test@example.com",
    sender_phone: "+1234567890",
    subject: "Test Notification",
    message: "This is a test notification message."
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await notificationsDb.create(formData)
      toast({
        title: "Success",
        description: "Test notification created successfully",
      })
      
      // Reset form
      setFormData({
        sender_name: "",
        sender_email: "",
        sender_phone: "",
        subject: "",
        message: ""
      })
    } catch (error) {
      console.error('Error creating test notification:', error)
      toast({
        title: "Error",
        description: "Failed to create test notification",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Test Notifications</h1>
        <p className="text-muted-foreground">
          Create test notifications to verify the system works
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Test Notification</CardTitle>
          <CardDescription>
            Submit a test notification to verify the notification system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="sender_name">Name</Label>
              <Input 
                id="sender_name" 
                name="sender_name"
                value={formData.sender_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="sender_email">Email</Label>
              <Input 
                id="sender_email" 
                name="sender_email"
                type="email"
                value={formData.sender_email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="sender_phone">Phone</Label>
              <Input 
                id="sender_phone" 
                name="sender_phone"
                type="tel"
                value={formData.sender_phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message" 
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Test Notification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}