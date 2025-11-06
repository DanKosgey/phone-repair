import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

type Notification = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export const notificationsDb = {
  // Get all unread notifications for admin dashboard
  async getUnreadCount() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .eq('is_archived', false)
      
      if (error) throw new Error(`Failed to fetch unread notifications count: ${error.message}`)
      return count || 0
    } catch (error) {
      console.error('Error in notificationsDb.getUnreadCount:', error)
      throw error
    }
  },

  // Get all notifications for admin dashboard
  async getAll(limit: number = 50) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw new Error(`Failed to fetch notifications: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in notificationsDb.getAll:', error)
      throw error
    }
  },

  // Get notification by ID
  async getById(id: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw new Error(`Failed to fetch notification: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in notificationsDb.getById:', error)
      throw error
    }
  },

  // Create new notification (from contact form)
  async create(notification: NotificationInsert) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase insert error:', error)
        throw new Error(`Failed to create notification: ${error.message}`)
      }
      return data
    } catch (error) {
      console.error('Error in notificationsDb.create:', error)
      throw error
    }
  },

  // Mark notification as read
  async markAsRead(id: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to mark notification as read: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in notificationsDb.markAsRead:', error)
      throw error
    }
  },

  // Archive notification
  async archive(id: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to archive notification: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in notificationsDb.archive:', error)
      throw error
    }
  },

  // Get unread notifications for real-time updates
  async getUnreadNotifications() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('is_read', false)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw new Error(`Failed to fetch unread notifications: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in notificationsDb.getUnreadNotifications:', error)
      throw error
    }
  }
}