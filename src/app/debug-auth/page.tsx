'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DebugAuthPage() {
  const { user, role, isLoading, isFetchingRole, refreshSession } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('DebugAuth: Auth state updated', { 
      userId: user?.id, 
      role, 
      isLoading,
      isFetchingRole
    })
  }, [user, role, isLoading, isFetchingRole])

  const handleRefresh = async () => {
    try {
      console.log('DebugAuth: Refreshing session')
      const result = await refreshSession()
      console.log('DebugAuth: Session refresh result', result)
    } catch (error) {
      console.error('DebugAuth: Session refresh error', error)
    }
  }

  const handleGoToAdmin = () => {
    router.push('/admin')
  }

  const handleGoToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="bg-card p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Auth State</h2>
        <div className="space-y-2">
          <p><strong>User ID:</strong> {user?.id || 'None'}</p>
          <p><strong>Email:</strong> {user?.email || 'None'}</p>
          <p><strong>Role:</strong> {role || 'None'}</p>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>Fetching Role:</strong> {isFetchingRole ? 'Yes' : 'No'}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Session
        </button>
        <button 
          onClick={handleGoToAdmin}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go to Admin
        </button>
        <button 
          onClick={handleGoToLogin}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}