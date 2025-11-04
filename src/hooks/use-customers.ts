import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersDb } from '../lib/db/customers'
import { Database } from '../../types/database.types'

export interface Customer {
  id: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  name: string
  email: string | null
  phone: string | null
  user_id: string | null
  notes: string | null
}

interface CreateCustomerData {
  name: string
  email?: string | null
  phone?: string | null
}

// Re-export the customersDb functions for direct use
export const useCustomers = () => {
  return {
    searchCustomers: customersDb.search,
    getCustomerById: customersDb.getById,
    createCustomer: customersDb.create
  }
}

// Hook for searching customers with debouncing
export const useCustomerSearch = (searchTerm: string) => {
  const { searchCustomers } = useCustomers()
  
  return useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: () => searchCustomers(searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook for creating a new customer
export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  const { createCustomer } = useCustomers()
  
  return useMutation({
    mutationFn: (data: CreateCustomerData) => createCustomer({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
    }),
    onSuccess: () => {
      // Invalidate customer search queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}