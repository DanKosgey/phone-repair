'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TestAuthPage() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Authentication Test</h1>
        
        {user ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold text-green-800">Authenticated User</h2>
              <p className="text-sm text-green-700">User ID: {user.id}</p>
              <p className="text-sm text-green-700">Email: {user.email}</p>
              <p className="text-sm text-green-700">Role: {role || 'No role assigned'}</p>
            </div>
            
            <Button onClick={handleSignOut} variant="outline" className="w-full">
              Sign Out
            </Button>
            
            <Button 
              onClick={() => router.push('/admin')} 
              className="w-full"
              disabled={role !== 'admin'}
            >
              Go to Admin Dashboard
            </Button>
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