'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Dashboard from "@/components/admin/Dashboard";

export default function AdminDashboardPage() {
  const { user, role, isLoading, isFetchingRole } = useAuth();
  const router = useRouter();
  const [renderDashboard, setRenderDashboard] = useState(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    console.log('AdminDashboardPage: Checking authentication', { 
      user: !!user, 
      role, 
      isLoading, 
      isFetchingRole,
      hasCheckedAuth: hasCheckedAuth.current,
      renderDashboard
    });
    
    // Prevent multiple checks
    if (hasCheckedAuth.current) {
      return;
    }
    
    // If we're still loading initial auth state, wait
    if (isLoading) {
      console.log('AdminDashboardPage: Still loading initial auth state');
      return;
    }
    
    // Mark that we've checked auth
    hasCheckedAuth.current = true;
    
    // If no user and not loading, redirect to login
    if (!user) {
      console.log('AdminDashboardPage: No user authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    // If user exists, render dashboard (we'll check role in the layout)
    console.log('AdminDashboardPage: User authenticated, setting render flag');
    setRenderDashboard(true);
  }, [user, role, isLoading, isFetchingRole, router, renderDashboard]);

  // If still loading initial auth state, show loading
  if (isLoading) {
    console.log('AdminDashboardPage: Showing initial loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If no user, redirect to login (this should have already happened above)
  if (!user) {
    console.log('AdminDashboardPage: No user, redirecting to login');
    router.push('/login');
    return null;
  }

  // Only render the dashboard when we're sure the user is authenticated
  if (!renderDashboard) {
    console.log('AdminDashboardPage: Preparing dashboard');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Preparing dashboard...</p>
        </div>
      </div>
    );
  }

  console.log('AdminDashboardPage: Rendering dashboard component');
  return <Dashboard />;
}