'use client';

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AdminTestFixPage() {
  const { user, isLoading, signIn, signOut } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@g.com');
  const [password, setPassword] = useState('Dan@2020');
  const [testStatus, setTestStatus] = useState('Ready to test');

  const handleLogin = async () => {
    try {
      setTestStatus('Logging in...');
      await signIn(email, password);
      setTestStatus('Login successful, waiting for redirect...');
    } catch (error: any) {
      setTestStatus(`Login failed: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      setTestStatus('Logging out...');
      await signOut();
      setTestStatus('Logged out successfully');
    } catch (error: any) {
      setTestStatus(`Logout failed: ${error.message}`);
    }
  };

  const handleGoToAdmin = () => {
    setTestStatus('Navigating to admin dashboard...');
    router.push('/admin');
  };

  const handleGoToLogin = () => {
    setTestStatus('Navigating to login page...');
    router.push('/login');
  };

  // Log auth state changes for debugging
  useEffect(() => {
    console.log('AdminTestFixPage: Auth state changed', { user, isLoading });
    if (!isLoading && user) {
      setTestStatus('User authenticated');
    } else if (!isLoading && !user) {
      setTestStatus('No user authenticated');
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="max-w-md w-full space-y-6 bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center">Admin Login Flow Test</h1>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800">Current Auth State</h2>
          <p className="text-sm text-blue-700">Loading: {isLoading ? 'true' : 'false'}</p>
          <p className="text-sm text-blue-700">User: {user ? user.email : 'null'}</p>
          <p className="text-sm text-blue-700">Test Status: {testStatus}</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="admin@g.com"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Dan@2020"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={handleLogin} disabled={isLoading}>
            Login
          </Button>
          <Button onClick={handleLogout} variant="outline" disabled={isLoading}>
            Logout
          </Button>
          <Button onClick={handleGoToLogin} variant="secondary">
            Go to Login Page
          </Button>
          <Button onClick={handleGoToAdmin} variant="secondary" disabled={!user}>
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