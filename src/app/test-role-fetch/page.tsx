'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Button } from '@/components/ui/button'

export default function TestRoleFetchPage() {
  const { user, isLoading } = useAuth()
  const [testResult, setTestResult] = useState<any>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [manualFetchResult, setManualFetchResult] = useState<any>(null)
  const [manualFetchError, setManualFetchError] = useState<string | null>(null)

  useEffect(() => {
    setTestResult({
      userId: user?.id,
      userEmail: user?.email,
      status: user ? 'Authenticated' : 'Not authenticated',
      isLoading,
      timestamp: new Date().toISOString()
    })
  }, [user, isLoading])

  const handleTestRoleViaAPI = async () => {
    setTestResult(null)
    setTestError(null)
    
    try {
      const response = await fetch('/api/test-role-fetch')
      const data = await response.json()
      
      if (!response.ok) {
        setTestError(data.error || 'API request failed')
        return
      }
      
      setTestResult(data)
    } catch (error: any) {
      setTestError(error.message)
    }
  }

  const handleManualRoleFetch = async () => {
    setManualFetchResult(null)
    setManualFetchError(null)
    
    if (!user?.id) {
      setManualFetchError('No user ID available')
      return
    }
    
    try {
      const supabase = getSupabaseBrowserClient()
      
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      // Fetch user profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        setManualFetchError(`Error fetching user profile: ${error.message}`)
        return
      }

      // data might be null if profile doesn't exist
      setManualFetchResult({
        userId: user.id,
        profile: data || null,
        message: 'Manual profile fetch completed'
      })
    } catch (error: any) {
      setManualFetchError(error.message)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Auth Fetch Test Page</h1>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <pre className="bg-white p-4 rounded overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Auth via API</h2>
          <Button onClick={handleTestRoleViaAPI} disabled={isLoading}>
            Test Auth via API
          </Button>
          
          {testError && (
            <div className="mt-4 bg-red-100 p-4 rounded">
              <h3 className="font-semibold text-red-800">API Error</h3>
              <p className="text-red-700">{testError}</p>
            </div>
          )}
          
          {testResult && (
            <div className="mt-4 bg-white p-4 rounded">
              <h3 className="font-semibold">API Result</h3>
              <pre className="overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Manual Profile Fetch</h2>
          <Button onClick={handleManualRoleFetch} disabled={isLoading || !user?.id}>
            Manual Profile Fetch
          </Button>
          
          {manualFetchError && (
            <div className="mt-4 bg-red-100 p-4 rounded">
              <h3 className="font-semibold text-red-800">Manual Fetch Error</h3>
              <p className="text-red-700">{manualFetchError}</p>
            </div>
          )}
          
          {manualFetchResult && (
            <div className="mt-4 bg-white p-4 rounded">
              <h3 className="font-semibold">Manual Fetch Result</h3>
              <pre className="overflow-auto">
                {JSON.stringify(manualFetchResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}