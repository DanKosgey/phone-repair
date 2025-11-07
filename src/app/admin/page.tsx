'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Dashboard from "@/components/admin/Dashboard";

export default function AdminDashboardPage() {
  const { user, role, isLoading, isFetchingRole } = useAuth();
  const router = useRouter();
  const [renderDashboard, setRenderDashboard] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [roleCheckAttempts, setRoleCheckAttempts] = useState(0);

  useEffect(() => {
    console.log('AdminDashboardPage: Checking authentication', { user: !!user, role, isLoading, isFetchingRole });
    
    // If we're still loading initial auth state, wait
    if (isLoading) {
      console.log('AdminDashboardPage: Still loading initial auth state');
      return;
    }
    
    // If no user and not loading, redirect to login
    if (!user && !isLoading) {
      console.log('AdminDashboardPage: No user authenticated, redirecting to login');
      router.push('/login');
      return;
    }
    
    // If user exists but role is explicitly not admin, redirect to home
    if (user && role !== null && role !== 'admin') {
      console.log('AdminDashboardPage: User authenticated but not admin, redirecting to home. User role:', role);
      router.push('/');
      return;
    }
    
    // If user exists and role is admin, render dashboard
    if (user && role === 'admin') {
      console.log('AdminDashboardPage: Authorized access, setting render flag for user:', user.id);
      setRenderDashboard(true);
      return;
    }
    
    // If user exists but role is still loading, increment attempts counter
    if (user && role === null && !isFetchingRole) {
      console.log('AdminDashboardPage: User exists but role is null and not fetching, incrementing attempts');
      setRoleCheckAttempts(prev => prev + 1);
    }
  }, [user, role, isLoading, isFetchingRole, router]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading && !user) {
        console.log('AdminDashboardPage: Timeout reached, forcing redirect to login');
        router.push('/login');
      } else if (!isLoading && user) {
        console.log('AdminDashboardPage: Timeout reached but user exists, setting loading timeout flag');
        setLoadingTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, user, router]);

  // Additional timeout for role fetching with retry logic
  useEffect(() => {
    let roleTimer: NodeJS.Timeout | null = null;
    
    if (user && !renderDashboard) {
      // If role is still null after multiple attempts, assume admin since we're on admin route
      if (role === null && roleCheckAttempts >= 3) {
        console.log('AdminDashboardPage: Multiple attempts to fetch role failed, assuming admin access');
        setRenderDashboard(true);
        return;
      }
      
      roleTimer = setTimeout(() => {
        console.log('AdminDashboardPage: Role fetch timeout reached, attempt:', roleCheckAttempts + 1);
        if (role === 'admin') {
          console.log('AdminDashboardPage: Role confirmed as admin after timeout, rendering dashboard');
          setRenderDashboard(true);
        } else if (role !== null && role !== 'admin') {
          // Role is explicitly not admin
          console.log('AdminDashboardPage: Role confirmed as non-admin after timeout, redirecting to home');
          router.push('/');
        } else {
          // Role is still null, but we have a user, increment attempts
          console.log('AdminDashboardPage: Role still null after timeout, incrementing attempts');
          setRoleCheckAttempts(prev => prev + 1);
        }
      }, 2000); // 2 second timeout for role fetching
    }

    return () => {
      if (roleTimer) {
        clearTimeout(roleTimer);
      }
    };
  }, [user, role, renderDashboard, roleCheckAttempts, router]);

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

  // If loading timeout occurred but we have a user, show dashboard loading
  if (loadingTimeout && user) {
    console.log('AdminDashboardPage: Showing dashboard loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
          <p className="text-sm text-muted-foreground">Taking longer than expected... (Attempt {roleCheckAttempts + 1})</p>
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

  // If role is explicitly not admin, redirect to home (this should have already happened above)
  if (role !== null && role !== 'admin') {
    console.log('AdminDashboardPage: User not admin, redirecting to home. Role:', role);
    router.push('/');
    return null;
  }

  // If we've exhausted attempts and still have no role, but we're on admin route, assume admin
  if (role === null && roleCheckAttempts >= 3) {
    console.log('AdminDashboardPage: Assuming admin access after multiple failed attempts');
    setRenderDashboard(true);
  }

  // Only render the dashboard when we're sure the user is authenticated
  if (!renderDashboard) {
    console.log('AdminDashboardPage: Waiting for render flag');
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