"use client"

import '@/index.css'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { useRealtimeTickets, useRealtimeProducts, useRealtimeOrders, useRealtimeCustomers } from "@/hooks/use-realtime"
import { AuthProvider } from '@/contexts/auth-context'
import { WebVitalsTracker } from '@/components/performance/WebVitalsTracker'
import { ThemeProvider } from 'next-themes'
import { useAppearanceSettings } from '@/hooks/use-appearance-settings'

// Component to handle real-time subscriptions
const RealtimeHandler = () => {
  // Set up all real-time subscriptions
  useRealtimeTickets()
  useRealtimeProducts()
  useRealtimeOrders()
  useRealtimeCustomers()
  
  return null
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useAppearanceSettings()
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WebVitalsTracker />
            <Toaster />
            <Sonner />
            <RealtimeHandler />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}