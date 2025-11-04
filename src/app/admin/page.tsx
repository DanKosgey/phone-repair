'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Dashboard from "@/components/admin/Dashboard";

export default function AdminDashboardPage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

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
      console.log('AdminDashboardPage: Authorized access, rendering dashboard for user:', user.id);
    }
  }, [user, role, isLoading, router]);

  if (isLoading) {
    console.log('AdminDashboardPage: Showing loading state');
    return <div>Loading...</div>;
  }

  if (!user || role !== 'admin') {
    console.log('AdminDashboardPage: Unauthorized, returning null');
    return null;
  }

  console.log('AdminDashboardPage: Rendering dashboard component');
  return <Dashboard />;
}