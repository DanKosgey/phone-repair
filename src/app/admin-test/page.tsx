'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminTestPage() {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  const handleGoToTickets = () => {
    router.push('/admin/tickets');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold text-center">Admin Navigation Test</h1>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800">Current Auth State</h2>
          <p className="text-sm text-blue-700">Loading: {isLoading ? 'true' : 'false'}</p>
          <p className="text-sm text-blue-700">User: {user ? user.email : 'null'}</p>
          <p className="text-sm text-blue-700">Role: {role || 'null'}</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button onClick={handleGoToAdmin} disabled={!user || role !== 'admin'}>
            Go to Admin Dashboard
          </Button>
          <Button onClick={handleGoToTickets} disabled={!user || role !== 'admin'}>
            Go to Tickets Page
          </Button>
        </div>
      </div>
    </div>
  );
}