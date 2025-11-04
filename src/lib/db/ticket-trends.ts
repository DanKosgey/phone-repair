import { getSupabaseBrowserClient } from '@/server/supabase/client'

// Utility functions for managing ticket trend data

/**
 * Refresh all ticket-related materialized views
 * This updates the trend data to reflect the current state of tickets in the database
 */
export async function refreshTicketTrends() {
  try {
    const supabase = getSupabaseBrowserClient()
    
    // Refresh all dashboard materialized views (including ticket-related ones)
    const { error } = await supabase.rpc('refresh_dashboard_materialized_views')
    
    if (error) {
      throw new Error(`Failed to refresh ticket trends: ${error.message}`)
    }
    
    console.log('Ticket trends refreshed successfully')
    return { success: true }
  } catch (error) {
    console.error('Error refreshing ticket trends:', error)
    return { success: false, error }
  }
}

/**
 * Clear all tickets from the database (DANGEROUS!)
 * WARNING: This will permanently delete all ticket data
 */
export async function clearAllTickets() {
  try {
    const supabase = getSupabaseBrowserClient()
    
    // First, we need to get admin permissions
    // This is a dangerous operation and should only be done by admins
    
    // Soft delete all tickets (set deleted_at for all records)
    const { error } = await supabase
      .from('tickets')
      .update({ deleted_at: new Date().toISOString() })
      .neq('id', '00000000-0000-0000-0000-000000000000') // This will match all records
    
    if (error) {
      throw new Error(`Failed to clear tickets: ${error.message}`)
    }
    
    // Refresh the materialized views to reflect the changes
    await refreshTicketTrends()
    
    console.log('All tickets cleared successfully')
    return { success: true }
  } catch (error) {
    console.error('Error clearing tickets:', error)
    return { success: false, error }
  }
}

/**
 * Get ticket statistics summary
 */
export async function getTicketStatsSummary() {
  try {
    const supabase = getSupabaseBrowserClient()
    
    // Get total ticket count
    const { count: totalTickets, error: countError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null)
    
    if (countError) throw countError
    
    return {
      totalTickets: totalTickets || 0
    }
  } catch (error) {
    console.error('Error fetching ticket stats summary:', error)
    throw error
  }
}

export const ticketTrendsDb = {
  refreshTicketTrends,
  clearAllTickets,
  getTicketStatsSummary
}