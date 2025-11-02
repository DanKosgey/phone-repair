'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AuthInfoPage() {
  const { user, role, isLoading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Authentication Information</h1>
        
        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold text-green-800">Authenticated User</h2>
              <p className="text-sm text-green-700">User ID: {user.id}</p>
              <p className="text-sm text-green-700">Email: {user.email}</p>
              <p className="text-sm text-green-700">Role: {role || 'No role assigned'}</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button onClick={handleGoToAdmin} disabled={role !== 'admin'}>
                Go to Admin Dashboard
              </Button>
              <Button onClick={handleSignOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold text-yellow-800">Not Authenticated</h2>
            <p className="text-sm text-yellow-700">Please sign in to continue</p>
            <Button 
              onClick={() => router.push('/login')} 
              className="w-full mt-4"
            >
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}