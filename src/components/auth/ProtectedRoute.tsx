'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export function ProtectedRoute({ children, requiredRole = 'admin' }: ProtectedRouteProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and user is not authenticated or doesn't have required role, redirect
    if (!isLoading && (!user || (requiredRole && role !== requiredRole))) {
      if (!user) {
        router.push('/login');
      } else {
        router.push('/'); // Redirect to home if user doesn't have required role
      }
    }
  }, [user, role, isLoading, requiredRole, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated and has required role, render children
  if (user && (!requiredRole || role === requiredRole)) {
    return <>{children}</>;
  }

  // If user is not authenticated or doesn't have required role, render nothing (redirect will happen)
  return null;
}