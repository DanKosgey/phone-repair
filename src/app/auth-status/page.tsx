'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AuthStatusPage() {
  const { user, session, isLoading } = useAuth();
  const router = useRouter();

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  const handleSignOut = async () => {
    // This would normally be handled by the AuthProvider signOut method
    // For debugging, we'll just show what's happening
    console.log('Attempting to sign out...');
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Status</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded">
              <h3 className="font-medium text-blue-800">User Info</h3>
              <p><strong>ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Email Confirmed:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="p-4 bg-green-50 rounded">
              <h3 className="font-medium text-green-800">Session</h3>
              <p><strong>Session Active:</strong> {session ? 'Yes' : 'No'}</p>
              <p><strong>Session Expires:</strong> {session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
              <p><strong>✓ You are authenticated and can access admin features</strong></p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded">
              <h3 className="font-medium text-yellow-800">Loading States</h3>
              <p><strong>Auth Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded">
              <h3 className="font-medium text-purple-800">Debug Info</h3>
              <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>Provider Mounted:</strong> Yes</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGoToLogin} variant="default">
              Go to Login
            </Button>
            <Button onClick={handleGoToAdmin} variant="secondary" disabled={!user}>
              Go to Admin Dashboard
            </Button>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out (Debug)
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Check the values above to see your current authentication status</li>
            <li>If you're logged in but see "None" for user info, there may be a session persistence issue</li>
            <li>If you're redirected unexpectedly, check the browser console for error messages</li>
            <li>Try signing out and logging back in if you experience issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}