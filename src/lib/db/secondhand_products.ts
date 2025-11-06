import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

export type SecondHandProduct = Database['public']['Tables']['second_hand_products']['Row']
export type SecondHandProductInsert = Database['public']['Tables']['second_hand_products']['Insert']
export type SecondHandProductUpdate = Database['public']['Tables']['second_hand_products']['Update']

export const secondHandProductsDb = {
  // Get all available second-hand products (for public marketplace)
  async getAll() {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      console.warn('Supabase client not available, returning empty array')
      return []
    }
    
    const { data, error } = await supabase
      .from('second_hand_products')
      .select('*')
      .eq('is_available', true) // Only return available products
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get all second-hand products (for admin use)
  async getAllAdmin() {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      console.warn('Supabase client not available, returning empty array')
      return []
    }
    
    const { data, error } = await supabase
      .from('second_hand_products')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get second-hand product by ID
  async getById(id: string) {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      console.warn('Supabase client not available')
      return null
    }
    
    const { data, error } = await supabase
      .from('second_hand_products')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    
    if (error) throw error
    return data
  },

  // Get second-hand products by condition
  async getByCondition(condition: 'Like New' | 'Good' | 'Fair') {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      console.warn('Supabase client not available, returning empty array')
      return []
    }
    
    const { data, error } = await supabase
      .from('second_hand_products')
      .select('*')
      .eq('condition', condition)
      .eq('is_available', true) // Only return available products
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Search second-hand products by product name or description
  async search(searchTerm: string) {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      console.warn('Supabase client not available, returning empty array')
      return []
    }
    
    const { data, error } = await supabase
      .from('second_hand_products')
      .select('*')
      .eq('is_available', true) // Only return available products
      .or(`seller_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get second-hand products by seller
  async getBySeller(sellerId: string) {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      console.warn('Supabase client not available, returning empty array')
      return []
    }
    
    const { data, error } = await supabase
      .from('second_hand_products')
      .select('*')
      .eq('seller_id', sellerId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new second-hand product listing
  async create(product: SecondHandProductInsert) {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    const { data, error } = await supabase
      .from('second_hand_products')
      .insert(product)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update second-hand product listing
  async update(id: string, updates: SecondHandProductUpdate) {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    const { data, error } = await supabase
      .from('second_hand_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete second-hand product listing (soft delete)
  async delete(id: string) {
    const supabase = getSupabaseBrowserClient()
    // Handle case where supabase client is not available
    if (!supabase) {
      throw new Error('Supabase client not available')
    }
    
    const { error } = await supabase
      .from('second_hand_products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}