import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Database } from '../../../types/database.types'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

// Helper function to verify admin role
async function verifyAdminRole() {
  const supabase = getSupabaseBrowserClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to perform this action')
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    throw new Error(`Failed to verify user permissions: ${profileError.message}`)
  }
  
  if (profile?.role !== 'admin') {
    throw new Error('You must be an administrator to perform this action')
  }
  
  return user
}

export const productsDb = {
  // Get all products
  async getAll() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch products: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.getAll:', error)
      throw error
    }
  },

  // Get product by ID
  async getById(id: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single()
      
      if (error) throw new Error(`Failed to fetch product: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.getById:', error)
      throw error
    }
  },

  // Get product by slug
  async getBySlug(slug: string | null) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .is('deleted_at', null)
        .single()
      
      if (error) throw new Error(`Failed to fetch product: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.getBySlug:', error)
      throw error
    }
  },

  // Search products
  async search(searchTerm: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to search products: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.search:', error)
      throw error
    }
  },

  // Get featured products
  async getFeatured() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch featured products: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.getFeatured:', error)
      throw error
    }
  },

  // Create product
  async create(product: ProductInsert) {
    try {
      const supabase = getSupabaseBrowserClient()
      
      // Verify admin role
      const user = await verifyAdminRole()
      
      // Ensure the product has the correct user_id set to the admin user
      const productData = {
        ...product,
        user_id: user.id // Explicitly set the user_id to the current admin user
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to create product: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.create:', error)
      throw error
    }
  },

  // Update product
  async update(id: string, updates: ProductUpdate) {
    try {
      const supabase = getSupabaseBrowserClient()
      
      // Verify admin role
      await verifyAdminRole()
      
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw new Error(`Failed to update product: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.update:', error)
      throw error
    }
  },

  // Delete product (soft delete)
  async delete(id: string) {
    try {
      const supabase = getSupabaseBrowserClient()
      
      // Verify admin role
      await verifyAdminRole()
      
      // Using type assertion to bypass TypeScript error for deleted_at field
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() } as any)
        .eq('id', id)
      
      if (error) throw new Error(`Failed to delete product: ${error.message}`)
    } catch (error) {
      console.error('Error in productsDb.delete:', error)
      throw error
    }
  },

  // Get low stock products
  async getLowStock(threshold: number = 5) {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock_quantity', threshold)
        .gt('stock_quantity', 0)
        .is('deleted_at', null)
        .order('stock_quantity', { ascending: true })
      
      if (error) throw new Error(`Failed to fetch low stock products: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.getLowStock:', error)
      throw error
    }
  },

  // Get out of stock products
  async getOutOfStock() {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('stock_quantity', 0)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch out of stock products: ${error.message}`)
      return data
    } catch (error) {
      console.error('Error in productsDb.getOutOfStock:', error)
      throw error
    }
  }
}