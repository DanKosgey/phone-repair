import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']
type OrderStatus = Database['public']['Enums']['order_status']

// Helper function to refresh dashboard materialized views
const refreshDashboardViews = async () => {
  try {
    const supabase = getSupabaseBrowserClient()
    await supabase.rpc('refresh_dashboard_materialized_views')
  } catch (error) {
    console.warn('Failed to refresh dashboard materialized views:', error)
  }
}

export const ordersDb = {
  // Get all orders with items
  async getAll() {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name))
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get order by ID
  async getById(id: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name))
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) throw error
    return data
  },

  // Get orders by status
  async getByStatus(status: OrderStatus) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name))
      `)
      .eq('status', status)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get user's orders
  async getByUserId(userId: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*, products(name))
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create order
  async create(order: OrderInsert) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single()
    
    if (error) throw error
    
    // Refresh materialized views to update dashboard metrics
    await refreshDashboardViews()
    
    return data
  },

  // Update order
  async update(id: string, updates: OrderUpdate) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    // Refresh materialized views to update dashboard metrics
    await refreshDashboardViews()
    
    return data
  },

  // Delete order (soft delete)
  async delete(id: string) {
    const supabase = getSupabaseBrowserClient()
    // Using type assertion to bypass TypeScript error for deleted_at field
    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('id', id)
    
    if (error) throw error
    
    // Refresh materialized views to update dashboard metrics
    await refreshDashboardViews()
  }
}
