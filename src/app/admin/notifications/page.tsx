'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Eye, 
  Archive, 
  Bell,
  AlertCircle
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

export default function AdminNotificationsPage() {
  const { user, role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'archived'>('all')

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        redirect('/login')
      }
    }
  }, [user, role, authLoading])

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsDb.getAll()
      
      // Apply filter
      let filteredData = data
      if (filter === 'unread') {
        filteredData = data.filter(n => !n.is_read && !n.is_archived)
      } else if (filter === 'archived') {
        filteredData = data.filter(n => n.is_archived)
      }
      
      setNotifications(filteredData)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationsDb.markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
      toast({
        title: "Success",
        description: "Notification marked as read",
      })
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const archiveNotification = async (id: string) => {
    try {
      await notificationsDb.archive(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      toast({
        title: "Success",
        description: "Notification archived",
      })
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          Manage customer messages and alerts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Customer Messages
              </CardTitle>
              <CardDescription>
                View and manage messages from customers
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={filter === 'unread' ? 'default' : 'outline'} 
                onClick={() => setFilter('unread')}
              >
                Unread
              </Button>
              <Button 
                variant={filter === 'archived' ? 'default' : 'outline'} 
                onClick={() => setFilter('archived')}
              >
                Archived
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg border ${!notification.is_read ? 'bg-blue-50 border-blue-200' : 'hover:bg-accent'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{notification.sender_name}</h3>
                        {!notification.is_read && (
                          <Badge className="bg-red-500 text-white" variant="secondary">
                            New
                          </Badge>
                        )}
                        {notification.is_archived && (
                          <Badge variant="outline">
                            Archived
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.sender_email}
                        {notification.sender_phone && ` • ${notification.sender_phone}`}
                      </p>
                      <p className="font-medium mt-2">{notification.subject}</p>
                      <p className="text-sm mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.is_read && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => router.push(`/admin/notifications/${notification.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!notification.is_archived && (
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => archiveNotification(notification.id)}
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}