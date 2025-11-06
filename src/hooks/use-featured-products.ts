import { useQuery } from '@tanstack/react-query'
import { productsDb } from '@/lib/db/products'

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productsDb.getFeatured(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 1,
  })
}