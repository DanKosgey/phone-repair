'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthSessionPage() {
  const { user, session, role, isLoading, isFetchingRole, refreshSession, isSessionValid } = useAuth()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  useEffect(() => {
    // Collect debug information
    setDebugInfo({
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      cookiesEnabled: typeof navigator !== 'undefined' ? navigator.cookieEnabled : 'N/A',
      localStorageAvailable: typeof localStorage !== 'undefined',
      sessionStorageAvailable: typeof sessionStorage !== 'undefined',
      location: typeof window !== 'undefined' ? window.location.href : 'N/A',
      user: user ? { 
        id: user.id, 
        email: user.email,
        aud: user.aud,
        role: user.role
      } : null,
      session: session ? { 
        expires_at: session.expires_at, 
        expires_in: session.expires_in,
        refresh_token: session.refresh_token ? '***' : null,
        token_type: session.token_type
      } : null,
      role,
      isLoading,
      isFetchingRole
    })
  }, [user, session, role, isLoading, isFetchingRole])

  const handleRefreshSession = async () => {
    try {
      console.log('Refreshing session...')
      const result = await refreshSession()
      console.log('Session refresh result:', result)
      setSessionInfo(result)
    } catch (error: any) {
      console.error('Session refresh error:', error)
      setSessionInfo({ error: error.message })
    }
  }

  const handleCheckSession = async () => {
    try {
      console.log('Checking session validity...')
      const isValid = await isSessionValid()
      console.log('Session valid:', isValid)
      setSessionInfo({ valid: isValid })
    } catch (error: any) {
      console.error('Session check error:', error)
      setSessionInfo({ error: error.message })
    }
  }

  const handleCheckStorage = () => {
    if (typeof window !== 'undefined') {
      const storageInfo: any = {}
      
      // Check localStorage
      try {
        storageInfo.localStorage = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('sb-') || key.includes('supabase'))) {
            storageInfo.localStorage[key] = localStorage.getItem(key)
          }
        }
      } catch (e) {
        storageInfo.localStorageError = e.message
      }
      
      // Check sessionStorage
      try {
        storageInfo.sessionStorage = {}
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('sb-') || key.includes('supabase'))) {
            storageInfo.sessionStorage[key] = sessionStorage.getItem(key)
          }
        }
      } catch (e) {
        storageInfo.sessionStorageError = e.message
      }
      
      // Check cookies
      try {
        storageInfo.cookies = {}
        const cookies = document.cookie.split(';')
        cookies.forEach(cookie => {
          const [name, value] = cookie.trim().split('=')
          if (name && (name.includes('sb-') || name.includes('supabase'))) {
            storageInfo.cookies[name] = value
          }
        })
      } catch (e) {
        storageInfo.cookiesError = e.message
      }
      
      setSessionInfo(storageInfo)
    }
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button onClick={handleRefreshSession}>Refresh Session</Button>
        <Button onClick={handleCheckSession}>Check Session Validity</Button>
        <Button onClick={handleCheckStorage}>Check Storage</Button>
      </div>

      {sessionInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}