import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getSupabaseBrowserClient } from '@/server/supabase/client';

export default function TestRolePage() {
  const { user, role, isLoading, isFetchingRole } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testRoleFetch = async () => {
    if (!user?.id) {
      setError('No user ID available');
      return;
    }

    try {
      setTestResult('Testing role fetch...');
      setError('');

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      console.log('Fetching role for user ID:', user.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching role:', error);
        setError(`Error fetching role: ${error.message}`);
        setTestResult('');
      } else {
        console.log('Role fetched successfully:', data);
        setTestResult(`Role: ${data?.role || 'null'}`);
      }
    } catch (err: any) {
      console.error('Exception during role fetch:', err);
      setError(`Exception: ${err.message}`);
      setTestResult('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Role Fetch Test</h1>
      
      {isLoading && <p>Loading auth state...</p>}
      {isFetchingRole && <p>Fetching role...</p>}
      
      {user ? (
        <div>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Current Role: {role || 'null'}</p>
          
          <button onClick={testRoleFetch} disabled={isFetchingRole}>
            Test Role Fetch
          </button>
        </div>
      ) : (
        <p>No user signed in</p>
      )}
      
      {testResult && <p style={{ color: 'green' }}>{testResult}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}