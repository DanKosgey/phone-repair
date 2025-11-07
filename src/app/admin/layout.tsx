'use client'

import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const hasRedirected = useRef(false)
  const mountedRef = useRef(true)
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [])

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    console.log('AdminLayout: Signing out user')
    
    try {
      // Sign out
      await signOut()
      
      console.log('AdminLayout: Sign out completed')
      
      if (mountedRef.current) {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        })
        
        // Force hard navigation (not soft navigation)
        window.location.href = '/login'
      }
    } catch (error: any) {
      console.error('AdminLayout: Error during sign out:', error)
      
      if (!mountedRef.current) return
      
      if (error.message === 'Auth session missing!') {
        if (mountedRef.current) {
          toast({
            title: "Session expired",
            description: "Your session has already expired.",
          })
        }
      } else {
        if (mountedRef.current) {
          toast({
            title: "Signed out",
            description: "You have been signed out.",
          })
        }
      }
      
      // Force hard navigation even on error
      if (mountedRef.current) {
        window.location.href = '/login'
      }
    }
  }, [signOut, toast])

  // Simplified authentication check - allow all authenticated users
  useEffect(() => {
    // Don't run if already redirected or component is unmounted
    if (hasRedirected.current || !mountedRef.current) return

    console.log('AdminLayout: Auth state check', { 
      userId: user?.id, 
      isLoading,
      hasRedirected: hasRedirected.current,
      isCheckingAuth
    })

    // Wait for initial loading to complete
    if (isLoading) {
      console.log('AdminLayout: Still loading auth state')
      return
    }

    // Clear any existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current)
    }

    // No user - redirect to login
    if (!user) {
      console.log('AdminLayout: No user authenticated, redirecting to login')
      hasRedirected.current = true
      if (mountedRef.current) {
        router.push('/login')
      }
      return
    }

    // User exists - proceed to dashboard (no role check)
    if (user) {
      console.log('AdminLayout: User authenticated, allowing access')
      if (mountedRef.current) {
        setIsCheckingAuth(false)
      }
      return
    }
  }, [user, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    console.log('AdminLayout: Showing loading state')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Double-check: if no user, don't render (redirect should have happened)
  if (!user) {
    return null
  }

  // User is authenticated - allow access
  console.log('AdminLayout: Rendering admin layout')
  return (
    <div className="min-h-screen flex w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}