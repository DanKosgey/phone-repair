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
    console.log('AdminLayout: Component mounted')
    mountedRef.current = true
    return () => {
      console.log('AdminLayout: Component unmounting')
      mountedRef.current = false
      if (checkTimeoutRef.current) {
        console.log('AdminLayout: Clearing timeout')
        clearTimeout(checkTimeoutRef.current)
      }
    }
  }, [])

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    console.log('AdminLayout: Signing out user')
    
    try {
      await signOut()
      
      console.log('AdminLayout: Sign out completed')
      
      if (mountedRef.current) {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        })
        
        // Force hard navigation
        console.log('AdminLayout: Redirecting to login via window.location')
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
      
      if (mountedRef.current) {
        console.log('AdminLayout: Redirecting to login via window.location after error')
        window.location.href = '/login'
      }
    }
  }, [signOut, toast])

  // Simplified authentication check
  useEffect(() => {
    // Don't run if already redirected or component is unmounted
    if (hasRedirected.current || !mountedRef.current) {
      console.log('AdminLayout: Skipping auth check - already redirected or unmounted', {
        hasRedirected: hasRedirected.current,
        mounted: mountedRef.current
      })
      return
    }

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
      console.log('AdminLayout: Clearing existing timeout')
      clearTimeout(checkTimeoutRef.current)
    }

    // No user - redirect to login
    if (!user) {
      console.log('AdminLayout: No user authenticated, redirecting to login')
      hasRedirected.current = true
      if (mountedRef.current) {
        console.log('AdminLayout: Executing router.push to /login')
        router.push('/login')
        console.log('AdminLayout: router.push command sent')
      }
      return
    }

    // User exists - proceed to dashboard
    if (user) {
      console.log('AdminLayout: User authenticated, allowing access', {
        userId: user.id,
        email: user.email
      })
      if (mountedRef.current) {
        setIsCheckingAuth(false)
      }
      return
    }
  }, [user, isLoading, router, toast])

  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    console.log('AdminLayout: Showing loading state', { isLoading, isCheckingAuth })
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // Double-check: if no user, don't render
  if (!user) {
    console.log('AdminLayout: No user, returning null')
    return null
  }

  // User is authenticated - allow access
  console.log('AdminLayout: Rendering admin layout', {
    userId: user.id,
    email: user.email
  })
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