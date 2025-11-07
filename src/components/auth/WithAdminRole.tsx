'use client';

import { useAuth } from '@/contexts/auth-context';

interface WithAdminRoleProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WithAdminRole({ children, fallback = null }: WithAdminRoleProps) {
  const { user, isLoading } = useAuth();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Render children only if user is authenticated
  if (user) {
    return <>{children}</>;
  }

  // Render fallback if provided, otherwise nothing
  return <>{fallback}</>;
}