'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function DebugAuthFlowPage() {
  const { 
    user, 
    role, 
    isLoading, 
    isFetchingRole, 
    signIn, 
    signOut
  } = useAuth()
  
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [signInStatus, setSignInStatus] = useState<string>('')
  const [signOutStatus, setSignOutStatus] = useState<string>('')

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

  const handleSignIn = async () => {
    setSignInStatus('Signing in...')
    try {
      await signIn('admin@g.com', 'Dan@2020')
      setSignInStatus('Sign in successful')
    } catch (error: any) {
      setSignInStatus(`Sign in failed: ${error.message}`)
    }
  }

  const handleSignOut = async () => {
    setSignOutStatus('Signing out...')
    try {
      await signOut()
      setSignOutStatus('Sign out successful')
    } catch (error: any) {
      setSignOutStatus(`Sign out failed: ${error.message}`)
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Debug Auth Flow</h1>
        
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <pre className="bg-white p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <div>
              <Button onClick={handleSignIn} disabled={isLoading || isFetchingRole}>
                Sign In as Admin
              </Button>
              {signInStatus && <p className="mt-2">{signInStatus}</p>}
            </div>
            
            <div>
              <Button onClick={handleSignOut} disabled={isLoading || isFetchingRole}>
                Sign Out
              </Button>
              {signOutStatus && <p className="mt-2">{signOutStatus}</p>}
            </div>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Sign In as Admin" to sign in with the admin account</li>
            <li>Observe the auth state changes in the Current Auth State section</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  )
}