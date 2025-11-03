import { useQuery } from '@tanstack/react-query'
import { dashboardDb } from '@/lib/db/dashboard'
import { queryKeys } from '@/lib/query-keys'

// Get admin dashboard metrics
export const useAdminMetrics = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.metrics(),
    queryFn: () => dashboardDb.getAdminMetrics(),
  })
}

// Get ticket summary
export const useTicketSummary = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.ticketSummary(),
    queryFn: () => dashboardDb.getTicketSummary(),
  })
}

// Get customer summary
export const useCustomerSummary = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.customerSummary(),
    queryFn: () => dashboardDb.getCustomerSummary(),
  })
}

// Get product sales summary
export const useProductSalesSummary = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.productSalesSummary(),
    queryFn: () => dashboardDb.getProductSalesSummary(),
  })
}

// Get monthly revenue trends
export const useMonthlyRevenueTrends = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.monthlyRevenueTrends(),
    queryFn: () => dashboardDb.getMonthlyRevenueTrends(),
  })
}

// Get ticket status distribution
export const useTicketStatusDistribution = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.ticketStatusDistribution(),
    queryFn: () => dashboardDb.getTicketStatusDistribution(),
  })
}

// Get top products by sales
export const useTopProductsBySales = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.topProductsBySales(),
    queryFn: () => dashboardDb.getTopProductsBySales(),
  })
}