'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AnalyticsDashboard from "@/components/admin/analytics/AnalyticsDashboard";

export default function AnalyticsPage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (!isLoading && user && role !== 'admin') {
      if (role !== null) {
        router.push('/');
      }
    }
  }, [user, role, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return <AnalyticsDashboard />;
}