'use client';

import { useAuth } from '@/contexts/auth-context';

interface WithAdminRoleProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WithAdminRole({ children, fallback = null }: WithAdminRoleProps) {
  const { role, isLoading } = useAuth();

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Render children only if user has admin role
  if (role === 'admin') {
    return <>{children}</>;
  }

  // Render fallback if provided, otherwise nothing
  return <>{fallback}</>;
}