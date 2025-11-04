import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']

// Helper function to refresh dashboard materialized views
const refreshDashboardViews = async () => {
  try {
    const supabase = getSupabaseBrowserClient()
    await supabase.rpc('refresh_dashboard_materialized_views')
  } catch (error) {
    console.warn('Failed to refresh dashboard materialized views:', error)
  }
}

export const customersDb = {
  // Search customers
  async search(query: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get customer by ID
  async getById(id: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) throw error
    return data
  },

  // Create customer
  async create(customer: CustomerInsert) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single()
    
    if (error) throw error
    
    // Refresh materialized views to update dashboard metrics
    await refreshDashboardViews()
    
    return data
  }
}