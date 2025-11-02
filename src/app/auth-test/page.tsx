'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthTestPage() {
  const { user, role, isLoading, signIn, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('AuthTestPage: Component mounted with auth state:', { user, role, isLoading });
  }, [user, role, isLoading]);

  const handleLogin = async () => {
    console.log('AuthTestPage: Attempting login');
    const result = await signIn('admin@g.com', 'Dan@2020');
    console.log('AuthTestPage: Login result:', result);
    
    if (result.error) {
      console.error('AuthTestPage: Login error:', result.error);
    } else {
      console.log('AuthTestPage: Login successful, redirecting to admin');
      router.push('/admin');
    }
  };

  const handleLogout = async () => {
    console.log('AuthTestPage: Logging out');
    await signOut();
    console.log('AuthTestPage: Logout complete');
  };

  const handleGoToLogin = () => {
    console.log('AuthTestPage: Going to login page');
    router.push('/login');
  };

  const handleGoToAdmin = () => {
    console.log('AuthTestPage: Going to admin dashboard');
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="max-w-md w-full space-y-6 bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Authentication Test</h1>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800">Current Auth State</h2>
          <p className="text-sm text-blue-700">Loading: {isLoading ? 'true' : 'false'}</p>
          <p className="text-sm text-blue-700">User: {user ? user.email : 'null'}</p>
          <p className="text-sm text-blue-700">Role: {role || 'null'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleLogin} disabled={isLoading}>Login</Button>
          <Button onClick={handleLogout} variant="outline" disabled={isLoading}>Logout</Button>
          <Button onClick={handleGoToLogin} variant="secondary">Go to Login Page</Button>
          <Button onClick={handleGoToAdmin} variant="secondary" disabled={!user || role !== 'admin'}>
            Go to Admin
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Check browser console for detailed logs</p>
        </div>
      </div>
    </div>
  );
}