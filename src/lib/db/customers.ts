import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

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
  // Get all customers
  async getAll(includeDeleted: boolean = false) {
    const supabase = getSupabaseBrowserClient()
    let queryBuilder = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Only filter out deleted customers if not explicitly including them
    if (!includeDeleted) {
      queryBuilder = queryBuilder.is('deleted_at', null)
    }
    
    const { data, error } = await queryBuilder
    
    if (error) throw error
    return data
  },

  // Search customers
  async search(query: string, includeDeleted: boolean = false) {
    const supabase = getSupabaseBrowserClient()
    let queryBuilder = supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    
    // Only filter out deleted customers if not explicitly including them
    if (!includeDeleted) {
      queryBuilder = queryBuilder.is('deleted_at', null)
    }
    
    const { data, error } = await queryBuilder
    
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
    
    // First, check if a customer with this email exists (including soft-deleted)
    const { data: existingCustomer, error: existingCustomerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customer.email)
      
    if (existingCustomerError && existingCustomerError.code !== 'PGRST116') {
      throw existingCustomerError
    }
    
    // If a soft-deleted customer exists with this email, restore them
    if (existingCustomer && existingCustomer.length > 0 && existingCustomer[0].deleted_at !== null) {
      const { data: restoredData, error: restoreError } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          phone: customer.phone,
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer[0].id)
        .select()
        .single()
      
      if (restoreError) throw restoreError
      
      // Refresh materialized views to update dashboard metrics
      await refreshDashboardViews()
      
      return restoredData
    }
    
    // Otherwise, create a new customer
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        user_id: null
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Refresh materialized views to update dashboard metrics
    await refreshDashboardViews()
    
    return data
  },

  // Delete customer (soft delete)
  async delete(id: string) {
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase
      .from('customers')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
    
    if (error) throw error
    
    // Refresh materialized views to update dashboard metrics
    await refreshDashboardViews()
    
    return true
  },
  
  // Restore deleted customer
  async restore(id: string) {
    const supabase = getSupabaseBrowserClient()
    const { data, error } = await supabase
      .from('customers')
      .update({ 
        deleted_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    // Refresh materialized views to update dashboard metrics
    await refreshDashboardViews()
    
    return data
  }
}