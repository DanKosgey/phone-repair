import React, { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/server/supabase/client';

export default function TestRolePage() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingRole, setIsFetchingRole] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [apiTestResult, setApiTestResult] = useState<string>('');
  const [apiError, setApiError] = useState<string>('');

  // Fetch user and role on client side only
  useEffect(() => {
    const fetchUserAndRole = async () => {
      try {
        // Only run on client side
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Fetch role
          setIsFetchingRole(true);
          const { data, error: roleError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (roleError) {
            console.error('Error fetching role:', roleError);
            setRole(null);
          } else {
            setRole(data?.role || null);
          }
          setIsFetchingRole(false);
        }
      } catch (err: any) {
        console.error('Exception during user/role fetch:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client side
    if (typeof window !== 'undefined') {
      fetchUserAndRole();
    } else {
      setIsLoading(false);
    }
  }, []);

  const testRoleFetch = async () => {
    if (!user?.id) {
      setError('No user ID available');
      return;
    }

    try {
      setTestResult('Testing role fetch...');
      setError('');
      setIsFetchingRole(true);

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
    } finally {
      setIsFetchingRole(false);
    }
  };

  const testApiRoute = async () => {
    try {
      setApiTestResult('Testing API route...');
      setApiError('');

      const response = await fetch('/api/test-role');
      const data = await response.json();

      if (!response.ok) {
        setApiError(`API Error: ${data.error} - ${data.details || ''}`);
        setApiTestResult('');
      } else {
        setApiTestResult(`API Result: Role = ${data.role}, User ID = ${data.userId}`);
      }
    } catch (err: any) {
      console.error('Exception during API test:', err);
      setApiError(`API Exception: ${err.message}`);
      setApiTestResult('');
    }
  };

  // Don't render anything during SSR
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Role Fetch Test</h1>
      
      {isLoading && <p>Loading auth state...</p>}
      {isFetchingRole && <p>Fetching role...</p>}
      
      {user ? (
        <div>
          <h2>User Information</h2>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
          <p>Current Role: {role || 'null'}</p>
          
          <div style={{ marginTop: '20px' }}>
            <h2>Client-side Test</h2>
            <button 
              onClick={testRoleFetch} 
              disabled={isFetchingRole}
              style={{ padding: '10px 15px', marginRight: '10px' }}
            >
              Test Role Fetch
            </button>
          </div>
          
          <div style={{ marginTop: '20px' }}>
            <h2>Server-side API Test</h2>
            <button 
              onClick={testApiRoute}
              style={{ padding: '10px 15px' }}
            >
              Test API Route
            </button>
          </div>
        </div>
      ) : (
        <p>No user signed in</p>
      )}
      
      {testResult && <p style={{ color: 'green', marginTop: '10px' }}>{testResult}</p>}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      
      {apiTestResult && <p style={{ color: 'green', marginTop: '10px' }}>{apiTestResult}</p>}
      {apiError && <p style={{ color: 'red', marginTop: '10px' }}>{apiError}</p>}
    </div>
  );
}