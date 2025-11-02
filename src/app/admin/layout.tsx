'use client'

import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, role, signOut, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('AdminLayout: Auth state updated in useEffect', { 
      userId: user?.id, 
      role, 
      isLoading,
      shouldRedirect: !isLoading && (!user || role !== 'admin')
    });
    
    // If not loading and user is not authenticated or not admin, redirect appropriately
    if (!isLoading) {
      if (!user) {
        console.log('AdminLayout: No user authenticated, redirecting to login');
        router.push('/login');
      } else if (user && role !== 'admin') {
        console.log('AdminLayout: User authenticated but not admin, redirecting to home. User role:', role);
        router.push('/');
      } else if (user && role === 'admin') {
        console.log('AdminLayout: User authorized, rendering admin layout for user:', user.id);
      } else {
        console.log('AdminLayout: Unknown state', { user: !!user, role, isLoading });
      }
    } else {
      console.log('AdminLayout: Still loading', { user: !!user, role, isLoading });
    }
  }, [user, role, isLoading, router])

  const handleSignOut = async () => {
    console.log('AdminLayout: Signing out user:', user?.id);
    await signOut();
    console.log('AdminLayout: Sign out completed, redirecting to login');
    router.push('/login');
  }

  // Show loading state while checking authentication
  if (isLoading) {
    console.log('AdminLayout: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is not authenticated or not admin, we'll redirect in useEffect
  if (!isLoading) {
    if (!user) {
      console.log('AdminLayout: No user in render check, should redirect to login');
      // Redirect will happen in useEffect
      return null;
    } else if (role !== 'admin') {
      console.log('AdminLayout: User not admin in render check, should redirect to home. Role:', role);
      // Redirect will happen in useEffect
      return null;
    } else {
      console.log('AdminLayout: User authorized in render check, showing admin layout');
    }
  }

  console.log('AdminLayout: Rendering admin layout for authorized user:', user.id);
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