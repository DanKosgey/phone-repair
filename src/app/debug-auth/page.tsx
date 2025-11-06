'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthPage() {
  const { user, session, role, isLoading, isFetchingRole, refreshSession, isSessionValid, recoverSession } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    // Collect initial debug information
    setDebugInfo({
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      cookiesEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : 'N/A',
      localStorageAvailable: typeof localStorage !== 'undefined',
      sessionStorageAvailable: typeof sessionStorage !== 'undefined',
      location: typeof window !== 'undefined' ? window.location.href : 'N/A',
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? { 
        expires_at: session.expires_at, 
        expires_in: session.expires_in,
        refresh_token: session.refresh_token ? '***' : null
      } : null,
      role,
      isLoading,
      isFetchingRole
    })
  }, [user, session, role, isLoading, isFetchingRole])

  const handleRefreshSession = async () => {
    try {
      addLog('Refreshing session...')
      const result = await refreshSession()
      addLog(`Session refresh result: ${result ? 'Success' : 'No session'}`)
    } catch (error: any) {
      addLog(`Session refresh error: ${error.message}`)
    }
  }

  const handleCheckSession = async () => {
    try {
      addLog('Checking session validity...')
      const isValid = await isSessionValid()
      addLog(`Session valid: ${isValid}`)
    } catch (error: any) {
      addLog(`Session check error: ${error.message}`)
    }
  }

  const handleRecoverSession = async () => {
    try {
      addLog('Recovering session...')
      const recovered = await recoverSession()
      addLog(`Session recovery result: ${recovered ? 'Success' : 'Failed'}`)
    } catch (error: any) {
      addLog(`Session recovery error: ${error.message}`)
    }
  }

  const handleClearLogs = () => {
    setLogs([])
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button onClick={handleRefreshSession}>Refresh Session</Button>
        <Button onClick={handleCheckSession}>Check Session Validity</Button>
        <Button onClick={handleRecoverSession}>Recover Session</Button>
        <Button variant="outline" onClick={handleClearLogs}>Clear Logs</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-auto max-h-96">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            ) : (
              <div>No logs yet. Perform actions to generate logs.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}