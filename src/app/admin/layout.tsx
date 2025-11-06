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
  const hasRedirected = useRef(false)
  const authCheckTimeout = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(true)

  // Clear timeout on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current)
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

  // Main authentication check effect
  useEffect(() => {
    // Don't run if already redirected or component is unmounted
    if (hasRedirected.current || !mountedRef.current) return

    console.log('AdminLayout: Auth state check', { 
      userId: user?.id, 
      role, 
      isLoading,
      isFetchingRole
    })

    // Clear any existing timeout
    if (authCheckTimeout.current) {
      clearTimeout(authCheckTimeout.current)
    }

    // Wait for initial loading to complete
    if (isLoading) {
      return
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

    // User exists but role is explicitly not admin
    if (role !== null && role !== 'admin') {
      console.log('AdminLayout: User not admin, redirecting to home. Role:', role)
      hasRedirected.current = true
      
      if (mountedRef.current) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin dashboard.",
          variant: "destructive",
        })
        
        router.push('/')
      }
      return
    }

    // User exists and is admin
    if (role === 'admin') {
      console.log('AdminLayout: User authorized as admin')
      if (mountedRef.current) {
        setIsCheckingAuth(false)
      }
      return
    }

    // User exists but role is null (still fetching) - set a timeout
    if (role === null && user) {
      // If we have a user but no role yet, wait for role to be fetched
      // Only set timeout if we're not already fetching the role
      if (!isFetchingRole) {
        authCheckTimeout.current = setTimeout(() => {
          if (!hasRedirected.current && mountedRef.current) {
            console.log('AdminLayout: Role check timeout, assuming admin role')
            setIsCheckingAuth(false)
          }
        }, 8000) // 8 second timeout
      }
      // Don't redirect to login if we have a user - we're still checking their role
      return
    }
  }, [user, role, isLoading, isFetchingRole, router, toast])

  // Show loading state while checking authentication
  if (isLoading || (isCheckingAuth && !hasRedirected.current)) {
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
  if (role !== 'admin' && role !== null) {
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