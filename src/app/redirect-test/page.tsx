'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectTestPage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('RedirectTest: Component mounted', { user: user?.id, role, isLoading });
    
    if (!isLoading) {
      if (user && role === 'admin') {
        console.log('RedirectTest: User is admin, redirecting to /admin');
        router.push('/admin');
      } else if (user) {
        console.log('RedirectTest: User authenticated but not admin, role:', role);
      } else {
        console.log('RedirectTest: No user authenticated');
      }
    }
  }, [user, role, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Checking authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Redirect Test</h1>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800">Current Auth State</h2>
          <p className="text-sm text-blue-700">User ID: {user ? user.id : 'null'}</p>
          <p className="text-sm text-blue-700">Email: {user ? user.email : 'null'}</p>
          <p className="text-sm text-blue-700">Role: {role || 'null'}</p>
          <p className="text-sm text-blue-700">Loading: {isLoading ? 'true' : 'false'}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => router.push('/admin')} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!user || role !== 'admin'}
          >
            Go to Admin Dashboard
          </button>
          <button 
            onClick={() => router.push('/login')} 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}