'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";

export default function AnalyticsPage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const [renderDashboard, setRenderDashboard] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && role !== 'admin') {
      if (role !== null) {
        router.push('/');
      }
    } else if (!isLoading && user && role === 'admin') {
      setRenderDashboard(true);
    }
  }, [user, role, isLoading, router]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading && !user) {
        router.push('/login');
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user || (role !== null && role !== 'admin')) {
    return null;
  }

  // Only render the dashboard when we're sure the user is authenticated
  if (!renderDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Preparing analytics dashboard...</p>
        </div>
      </div>
    );
  }

  return <AnalyticsDashboard />;
}