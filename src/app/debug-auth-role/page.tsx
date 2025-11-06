'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DebugAuthRolePage() {
  const { user, role, isLoading, isFetchingRole, signIn, signOut, refreshSession } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [forceRefresh, setForceRefresh] = useState(0);

  useEffect(() => {
    setDebugInfo({
      userId: user?.id,
      userEmail: user?.email,
      role,
      isLoading,
      isFetchingRole,
      timestamp: new Date().toISOString()
    });
  }, [user, role, isLoading, isFetchingRole]);

  const handleLogin = async () => {
    try {
      await signIn('admin@g.com', 'Dan@2020');
    } catch (error) {
      console.error('DebugAuthRole: Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('DebugAuthRole: Logout error:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      const session = await refreshSession();
      console.log('DebugAuthRole: Session refresh result:', session);
      setForceRefresh(prev => prev + 1);
    } catch (error) {
      console.error('DebugAuthRole: Refresh error:', error);
    }
  };

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="max-w-2xl w-full space-y-6 bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Authentication Debug Tool</h1>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">Current Auth State</h2>
          <pre className="text-sm text-blue-700 bg-blue-100 p-2 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleLogin} disabled={isLoading || isFetchingRole}>
            Login as Admin
          </Button>
          <Button onClick={handleLogout} variant="outline" disabled={isLoading || isFetchingRole}>
            Logout
          </Button>
          <Button onClick={handleRefresh} variant="secondary">
            Refresh Session
          </Button>
          <Button onClick={handleGoToLogin} variant="secondary">
            Go to Login
          </Button>
          <Button onClick={handleGoToAdmin} disabled={!user || (role !== null && role !== 'admin')}>
            Go to Admin Dashboard
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Check browser console for detailed logs</p>
          <p>Force refresh counter: {forceRefresh}</p>
        </div>
      </div>
    </div>
  );
}