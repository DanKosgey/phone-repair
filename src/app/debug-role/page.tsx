'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function DebugRolePage() {
  const { user, role, isLoading, isFetchingRole, signIn, signOut } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [apiResult, setApiResult] = useState<any>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    setDebugInfo({
      userId: user?.id,
      userEmail: user?.email,
      role,
      isLoading,
      isFetchingRole,
      timestamp: new Date().toISOString()
    })
  }, [user, role, isLoading, isFetchingRole])

  const handleCheckRoleViaAPI = async () => {
    setApiResult(null)
    setApiError(null)
    
    try {
      const response = await fetch('/api/debug-role')
      const data = await response.json()
      
      if (!response.ok) {
        setApiError(data.error || 'API request failed')
        return
      }
      
      setApiResult(data)
    } catch (error: any) {
      setApiError(error.message)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Role Debugging Page</h1>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <pre className="bg-white p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">API Role Check</h2>
          <Button onClick={handleCheckRoleViaAPI} disabled={isLoading || isFetchingRole}>
            Check Role via API
          </Button>
          
          {apiError && (
            <div className="mt-4 bg-red-100 p-4 rounded">
              <h3 className="font-semibold text-red-800">API Error</h3>
              <p className="text-red-700">{apiError}</p>
            </div>
          )}
          
          {apiResult && (
            <div className="mt-4 bg-white p-4 rounded">
              <h3 className="font-semibold">API Result</h3>
              <pre className="overflow-auto">
                {JSON.stringify(apiResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}