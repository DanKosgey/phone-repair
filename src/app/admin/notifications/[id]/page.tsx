'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Archive, 
  Reply,
  Check
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import { notificationsDb } from '@/lib/db/notifications'

type Notification = {
  id: string
  sender_name: string
  sender_email: string
  sender_phone: string | null
  subject: string
  message: string
  is_read: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}

export default function NotificationDetailPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [notification, setNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        redirect('/login')
      }
    }
  }, [user, authLoading])

  // Fetch notification
  useEffect(() => {
    fetchNotification()
  }, [params.id])

  const fetchNotification = async () => {
    try {
      setLoading(true)
      const data = await notificationsDb.getById(params.id)
      setNotification(data)
      
      // Mark as read if not already read
      if (data && !data.is_read) {
        await notificationsDb.markAsRead(params.id)
      }
    } catch (error) {
      console.error('Error fetching notification:', error)
      toast({
        title: "Error",
        description: "Failed to fetch notification",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const archiveNotification = async () => {
    try {
      await notificationsDb.archive(params.id)
      toast({
        title: "Success",
        description: "Notification archived",
      })
      router.push('/admin/notifications')
    } catch (error) {
      console.error('Error archiving notification:', error)
      toast({
        title: "Error",
        description: "Failed to archive notification",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!notification) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Notification Not Found</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">The notification you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/admin/notifications')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Message Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>{notification.subject}</CardTitle>
              <CardDescription>
                From {notification.sender_name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!notification.is_archived && (
                <Button variant="outline" onClick={archiveNotification}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              )}
              <Button>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">From</h3>
              <p className="font-medium">{notification.sender_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p>{notification.sender_email}</p>
            </div>
            {notification.sender_phone && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                <p>{notification.sender_phone}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
              <p>{formatDate(notification.created_at)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Message</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{notification.message}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-4">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">
              {notification.is_read ? 'Read' : 'Unread'}
            </span>
            {notification.is_archived && (
              <>
                <span className="text-muted-foreground">•</span>
                <Archive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Archived</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}