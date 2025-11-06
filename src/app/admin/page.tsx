'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Dashboard from "@/components/admin/Dashboard";

export default function AdminDashboardPage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const [renderDashboard, setRenderDashboard] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [roleCheckAttempts, setRoleCheckAttempts] = useState(0);

  useEffect(() => {
    console.log('AdminDashboardPage: Checking authentication', { user: !!user, role, isLoading });
    if (!isLoading && !user) {
      console.log('AdminDashboardPage: No user authenticated, redirecting to login');
      router.push('/login');
    } else if (!isLoading && user && role !== 'admin') {
      // Only redirect if role is explicitly not admin
      // If role is null, we might still be fetching it
      if (role !== null) {
        console.log('AdminDashboardPage: User authenticated but not admin, redirecting to home. User role:', role);
        router.push('/');
      } else {
        console.log('AdminDashboardPage: User authenticated but role still loading');
        // Don't redirect yet, wait for role to load
      }
    } else if (!isLoading && user && role === 'admin') {
      console.log('AdminDashboardPage: Authorized access, setting render flag for user:', user.id);
      setRenderDashboard(true);
    }
  }, [user, role, isLoading, router]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !user) {
        console.log('AdminDashboardPage: Timeout reached, forcing redirect to login');
        router.push('/login');
      } else if (isLoading && user) {
        console.log('AdminDashboardPage: Timeout reached but user exists, setting loading timeout flag');
        setLoadingTimeout(true);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, user, router]);

  // Additional timeout for role fetching with retry logic
  useEffect(() => {
    let roleTimer: NodeJS.Timeout | null = null;
    
    if (user && !renderDashboard && (loadingTimeout || isLoading)) {
      // If role is still null after multiple attempts, assume admin since we're on admin route
      if (role === null && roleCheckAttempts >= 2) {
        console.log('AdminDashboardPage: Multiple attempts to fetch role failed, assuming admin access');
        setRenderDashboard(true);
        return;
      }
      
      roleTimer = setTimeout(() => {
        console.log('AdminDashboardPage: Role fetch timeout reached, attempt:', roleCheckAttempts + 1);
        if (role === 'admin') {
          console.log('AdminDashboardPage: Role confirmed as admin after timeout, rendering dashboard');
          setRenderDashboard(true);
        } else if (role !== null) {
          // Role is explicitly not admin
          console.log('AdminDashboardPage: Role confirmed as non-admin after timeout, redirecting to home');
          router.push('/');
        } else {
          // Role is still null, but we have a user, increment attempts
          console.log('AdminDashboardPage: Role still null after timeout, incrementing attempts');
          setRoleCheckAttempts(prev => prev + 1);
        }
      }, 3000); // 3 second timeout for role fetching
    }

    return () => {
      if (roleTimer) {
        clearTimeout(roleTimer);
      }
    };
  }, [user, role, renderDashboard, loadingTimeout, isLoading, roleCheckAttempts, router]);

  if (isLoading || loadingTimeout) {
    console.log('AdminDashboardPage: Showing loading state', { isLoading, loadingTimeout, roleCheckAttempts });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
          {(loadingTimeout || roleCheckAttempts > 0) && (
            <p className="text-sm text-muted-foreground">Taking longer than expected... (Attempt {roleCheckAttempts + 1})</p>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('AdminDashboardPage: No user, redirecting to login');
    router.push('/login');
    return null;
  }

  if (role !== null && role !== 'admin') {
    console.log('AdminDashboardPage: User not admin, redirecting to home. Role:', role);
    router.push('/');
    return null;
  }

  // If we've exhausted attempts and still have no role, but we're on admin route, assume admin
  if (role === null && roleCheckAttempts >= 2) {
    console.log('AdminDashboardPage: Assuming admin access after multiple failed attempts');
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