import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TicketInsert = Database['public']['Tables']['tickets']['Insert']
type TicketUpdate = Database['public']['Tables']['tickets']['Update']
type TicketStatus = Database['public']['Enums']['ticket_status']

// Helper function to refresh dashboard materialized views
const refreshDashboardViews = async () => {
  try {
    const supabase = getSupabaseBrowserClient()
    await supabase.rpc('refresh_dashboard_materialized_views')
  } catch (error) {
    console.warn('Failed to refresh dashboard materialized views:', error)
  }
}

export const ticketsDb = {
  // Get all tickets
  async getAll() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch tickets: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getAll:', error)
      throw error
    }
  },

  // Get ticket by ID
  async getById(id: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()
      
      if (error) throw new Error(`Failed to fetch ticket: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getById:', error)
      throw error
    }
  },

  // Get ticket by ticket number (for public tracking)
  async getByTicketNumber(ticketNumber: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_number', ticketNumber)
        .is('deleted_at', null)
        .single()
      
      // Handle the case where no ticket is found
      if (error) {
        // Check if it's a "no rows" error (which is expected when ticket doesn't exist)
        if (error.code === 'PGRST116') {
          return null; // No ticket found
        }
        throw new Error(`Failed to fetch ticket: ${error.message}`)
      }
      
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getByTicketNumber:', error)
      throw error
    }
  },

  // Get tickets by customer name and phone number (for public tracking)
  async getByCustomerInfo(customerName: string, phoneNumber: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('customer_name', customerName)
        .eq('customer_phone', phoneNumber)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      // Handle the case where no tickets are found
      if (error) {
        // Check if it's a "no rows" error (which is expected when no tickets exist)
        if (error.code === 'PGRST116') {
          return []; // No tickets found
        }
        throw new Error(`Failed to fetch tickets: ${error.message}`)
      }
      
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getByCustomerInfo:', error)
      throw error
    }
  },

  // Get tickets by phone number only (for public tracking) - NEW FUNCTION
  async getByPhoneNumber(phoneNumber: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('customer_phone', phoneNumber)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      // Handle the case where no tickets are found
      if (error) {
        // Check if it's a "no rows" error (which is expected when no tickets exist)
        if (error.code === 'PGRST116') {
          return []; // No tickets found
        }
        throw new Error(`Failed to fetch tickets: ${error.message}`)
      }
      
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getByPhoneNumber:', error)
      throw error
    }
  },

  // Create new ticket
  async create(ticket: TicketInsert) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to create ticket: ${error.message}`)
      
      // Refresh materialized views to update dashboard metrics
      await refreshDashboardViews()
      
      return data
    } catch (error) {
      console.error('Error in ticketsDb.create:', error)
      throw error
    }
  },

  // Update ticket
  async update(id: string, updates: TicketUpdate) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to update ticket: ${error.message}`)
      
      // Refresh materialized views to update dashboard metrics
      await refreshDashboardViews()
      
      return data
    } catch (error) {
      console.error('Error in ticketsDb.update:', error)
      throw error
    }
  },

  // Delete ticket (soft delete)
  async delete(id: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      // Using type assertion to bypass TypeScript error for deleted_at field
      const { error } = await supabase
        .from('tickets')
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', id)
      
      if (error) throw new Error(`Failed to delete ticket: ${error.message}`)
      
      // Refresh materialized views to update dashboard metrics
      await refreshDashboardViews()
    } catch (error) {
      console.error('Error in ticketsDb.delete:', error)
      throw error
    }
  },

  // Filter tickets by status
  async getByStatus(status: TicketStatus) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', status)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch tickets by status: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getByStatus:', error)
      throw error
    }
  },

  // Get tickets by customer ID
  async getTicketsByCustomerId(customerId: string) {
    try {
      const supabase: any = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, status, device_type, device_brand, device_model, final_cost, created_at')
        .eq('customer_id', customerId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch customer tickets: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getTicketsByCustomerId:', error)
      throw error
    }
  },

  // Search tickets
  async search(query: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .or(`ticket_number.ilike.%${query}%,customer_name.ilike.%${query}%,device_brand.ilike.%${query}%,device_model.ilike.%${query}%`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to search tickets: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in ticketsDb.search:', error)
      throw error
    }
  },

  // Get user's tickets
  async getByUserId(userId: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch user tickets: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getByUserId:', error)
      throw error
    }
  },

  // Get recent tickets for dashboard
  async getRecent(limit: number = 5) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tickets')
        .select('id, ticket_number, status, customer_name, device_brand, device_model, created_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw new Error(`Failed to fetch recent tickets: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in ticketsDb.getRecent:', error)
      throw error
    }
  }
}