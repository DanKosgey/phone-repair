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
  const { user, role, signOut, isLoading, isFetchingRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)
  
  // Refs to track component state and prevent memory leaks
  const isMountedRef = useRef(true)
  const authCheckTimerRef = useRef<NodeJS.Timeout | null>(null)
  const roleCheckTimerRef = useRef<NodeJS.Timeout | null>(null)
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup function for all timers
  const clearAllTimers = useCallback(() => {
    if (authCheckTimerRef.current) {
      clearTimeout(authCheckTimerRef.current)
      authCheckTimerRef.current = null
    }
    if (roleCheckTimerRef.current) {
      clearTimeout(roleCheckTimerRef.current)
      roleCheckTimerRef.current = null
    }
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current)
      redirectTimeoutRef.current = null
    }
  }, [])

  // Handle sign out with proper error handling
  const handleSignOut = useCallback(async () => {
    if (!isMountedRef.current) return
    
    console.log('AdminLayout: Signing out user')
    
    try {
      // Sign out
      await signOut()
      
      console.log('AdminLayout: Sign out completed')
      
      if (isMountedRef.current) {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        })
        
        // Force hard navigation (not soft navigation)
        window.location.href = '/login'
      }
    } catch (error: any) {
      console.error('AdminLayout: Error during sign out:', error)
      
      if (!isMountedRef.current) return
      
      if (error.message === 'Auth session missing!') {
        toast({
          title: "Session expired",
          description: "Your session has already expired.",
        })
      } else {
        toast({
          title: "Signed out",
          description: "You have been signed out.",
        })
      }
      
      // Force hard navigation even on error
      window.location.href = '/login'
    }
  }, [signOut, toast])

  // Main authentication check effect
  useEffect(() => {
    // Don't run if already redirected
    if (hasRedirected || !isMountedRef.current) return

    console.log('AdminLayout: Auth state check', { 
      userId: user?.id, 
      role, 
      isLoading,
      isFetchingRole
    })

    // Wait for initial loading to complete
    if (isLoading) {
      return
    }

    // No user - redirect to login
    if (!user) {
      console.log('AdminLayout: No user authenticated, redirecting to login')
      setHasRedirected(true)
      router.push('/login')
      return
    }

    // User exists but role is explicitly not admin
    if (role !== null && role !== 'admin') {
      console.log('AdminLayout: User not admin, redirecting to home. Role:', role)
      setHasRedirected(true)
      
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      })
      
      router.push('/')
      return
    }

    // User exists and is admin
    if (role === 'admin') {
      console.log('AdminLayout: User authorized as admin')
      setIsCheckingAuth(false)
      return
    }

    // User exists but role is null (still fetching)
    if (role === null) {
      console.log('AdminLayout: User authenticated but role still loading')
      // Keep checking auth state
      setIsCheckingAuth(true)
    }
  }, [user, role, isLoading, isFetchingRole, router, toast, hasRedirected])

  // Timeout for role fetching
  useEffect(() => {
    // Clear any existing timers
    clearAllTimers()

    // Don't set timeout if we already have a role or no user
    if (!user || role !== null || hasRedirected) {
      return
    }

    // If still loading after reasonable time, show warning but don't redirect
    if (isLoading || isFetchingRole) {
      console.log('AdminLayout: Setting role fetch timeout')
      
      roleCheckTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current || hasRedirected) return
        
        console.log('AdminLayout: Role fetch timeout reached')
        
        // If we still don't have a role after timeout, redirect to home
        // This prevents users from being stuck in loading state
        if (role === null) {
          console.log('AdminLayout: Role fetch timed out, denying access')
          setHasRedirected(true)
          
          toast({
            title: "Authentication Timeout",
            description: "Could not verify admin permissions. Please try again.",
            variant: "destructive",
          })
          
          router.push('/')
        } else if (role === 'admin') {
          console.log('AdminLayout: Role confirmed as admin after timeout')
          setIsCheckingAuth(false)
        }
      }, 8000) // 8 second timeout for role verification
    }

    return clearAllTimers
  }, [user, role, isLoading, isFetchingRole, router, toast, hasRedirected, clearAllTimers])

  // Global timeout to prevent infinite loading
  useEffect(() => {
    if (!user || hasRedirected) return

    authCheckTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current || hasRedirected) return
      
      console.log('AdminLayout: Global auth timeout reached')
      
      // If we're still loading after 10 seconds, something is wrong
      if (isCheckingAuth) {
        console.log('AdminLayout: Auth check taking too long, denying access')
        setHasRedirected(true)
        setIsCheckingAuth(false)
        
        toast({
          title: "Authentication Error",
          description: "Authentication is taking too long. Please try logging in again.",
          variant: "destructive",
        })
        
        router.push('/login')
      }
    }, 10000) // 10 second global timeout

    return () => {
      if (authCheckTimerRef.current) {
        clearTimeout(authCheckTimerRef.current)
        authCheckTimerRef.current = null
      }
    }
  }, [user, isCheckingAuth, router, toast, hasRedirected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      clearAllTimers()
      console.log('AdminLayout: Cleanup completed')
    }
  }, [clearAllTimers])

  // Show loading state while checking authentication
  if (isLoading || (isCheckingAuth && !hasRedirected)) {
    console.log('AdminLayout: Showing loading state')
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying permissions...</p>
          {isFetchingRole && (
            <p className="text-sm text-muted-foreground">Loading user role...</p>
          )}
        </div>
      </div>
    )
  }

  // Double-check: if no user, don't render (redirect should have happened)
  if (!user) {
    return null
  }

  // Double-check: if role is not admin, don't render (redirect should have happened)
  if (role !== 'admin') {
    return null
  }

  // User is authenticated and authorized as admin
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