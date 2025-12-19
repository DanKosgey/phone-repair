import { supabase } from './supabase';

export interface Customer {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  name: string;
  email: string;
  phone: string | null;
  user_id: string | null;
}

// Search customers by name, email, or phone (case-insensitive)
export async function searchCustomers(query: string): Promise<Customer[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    throw error;
  }
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching customer:', error);
    return null;
  }
}

// Create a new customer
export async function createCustomer(customerData: {
  name: string;
  email?: string | null;
  phone?: string | null;
}): Promise<Customer> {
  try {
    // First, check if a customer with this email exists (including soft-deleted)
    const { data: existingCustomer, error: existingCustomerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customerData.email);

    if (existingCustomerError && existingCustomerError.code !== 'PGRST116') {
      throw existingCustomerError;
    }

    // If a soft-deleted customer exists with this email, restore them
    if (existingCustomer && existingCustomer.length > 0 && existingCustomer[0].deleted_at !== null) {
      const { data: restoredData, error: restoreError } = await supabase
        .from('customers')
        .update({
          name: customerData.name,
          phone: customerData.phone,
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer[0].id)
        .select()
        .single();

      if (restoreError) throw restoreError;
      return restoredData;
    }

    // Otherwise, create a new customer
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: customerData.name,
        email: customerData.email || '',
        phone: customerData.phone || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        user_id: null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}