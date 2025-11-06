'use client'

import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, signOut, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authCheckTimeout, setAuthCheckTimeout] = useState(false)
  const [roleCheckAttempts, setRoleCheckAttempts] = useState(0)

  useEffect(() => {
    console.log('AdminLayout: Auth state updated in useEffect', { 
      userId: user?.id, 
      role, 
      isLoading
    });
    
    // Check authentication and redirect if needed
    if (!isLoading) {
      if (!user) {
        console.log('AdminLayout: No user authenticated, redirecting to login');
        router.push('/login');
      } else if (user && role !== 'admin') {
        // Only redirect if role is explicitly not admin
        // If role is null, we might still be fetching it
        if (role !== null) {
          console.log('AdminLayout: User authenticated but not admin, redirecting to home. User role:', role);
          router.push('/');
        } else {
          console.log('AdminLayout: User authenticated but role still loading');
          // Don't redirect yet, wait for role to load
        }
      } else if (user && role === 'admin') {
        console.log('AdminLayout: User authorized, rendering admin layout for user:', user.id);
        setIsCheckingAuth(false);
      }
    }
  }, [user, role, isLoading, router])

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading || isCheckingAuth) {
        console.log('AdminLayout: Timeout reached, setting timeout flag');
        setAuthCheckTimeout(true);
        setIsCheckingAuth(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, isCheckingAuth]);

  // Additional timeout for role confirmation with retry logic
  useEffect(() => {
    let roleTimer: NodeJS.Timeout | null = null;
    
    if (user && (isLoading || isCheckingAuth || authCheckTimeout)) {
      // If role is still null after multiple attempts, assume admin since we're on admin route
      if (role === null && roleCheckAttempts >= 2) {
        console.log('AdminLayout: Multiple attempts to fetch role failed, assuming admin access on admin route');
        setIsCheckingAuth(false);
        return;
      }
      
      roleTimer = setTimeout(() => {
        console.log('AdminLayout: Role confirmation timeout reached, attempt:', roleCheckAttempts + 1);
        if (role === 'admin') {
          console.log('AdminLayout: Role confirmed as admin after timeout');
          setIsCheckingAuth(false);
        } else if (role !== null) {
          // Role is explicitly not admin
          console.log('AdminLayout: Role confirmed as non-admin after timeout, redirecting to home');
          router.push('/');
        } else {
          // Role is still null, but we have a user on admin route
          console.log('AdminLayout: Role still null but on admin route, incrementing attempts');
          setRoleCheckAttempts(prev => prev + 1);
        }
      }, 3000); // 3 second timeout for role confirmation
    }

    return () => {
      if (roleTimer) {
        clearTimeout(roleTimer);
      }
    };
  }, [user, role, isLoading, isCheckingAuth, authCheckTimeout, roleCheckAttempts, router]);

  const handleSignOut = async () => {
    console.log('AdminLayout: Signing out user:', user?.id);
    try {
      await signOut();
      console.log('AdminLayout: Sign out completed, redirecting to login');
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      router.push('/login');
    } catch (error: any) {
      console.error('AdminLayout: Error during sign out:', error);
      // Handle AuthSessionMissingError specifically
      if (error.message === 'Auth session missing!') {
        toast({
          title: "Session expired",
          description: "Your session has already expired. You have been logged out.",
        });
      } else {
        toast({
          title: "Sign out issue",
          description: "There was a problem signing out. You have been logged out locally.",
          variant: "destructive",
        });
      }
      // Even if sign out fails, redirect to login page
      router.push('/login');
    }
  }

  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    console.log('AdminLayout: Showing loading state', { isLoading, isCheckingAuth, authCheckTimeout, roleCheckAttempts });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Authenticating...</p>
          {(authCheckTimeout || roleCheckAttempts > 0) && (
            <p className="text-sm text-muted-foreground">Taking longer than expected... (Attempt {roleCheckAttempts + 1})</p>
          )}
        </div>
      </div>
    )
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    console.log('AdminLayout: No user, redirecting to login');
    router.push('/login');
    return null;
  }

  // If role is explicitly not admin, redirect to home
  if (role !== null && role !== 'admin') {
    console.log('AdminLayout: User not admin, redirecting to home. Role:', role);
    router.push('/');
    return null;
  }

  // If we've exhausted attempts and still have no role, but we're on admin route, assume admin
  if (role === null && roleCheckAttempts >= 2) {
    console.log('AdminLayout: Assuming admin access after multiple failed attempts');
  }

  console.log('AdminLayout: Rendering admin layout for user:', user?.id);
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