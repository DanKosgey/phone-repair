'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect } from 'react'

export default function DebugAuthPage() {
  const { user, role, isLoading, session } = useAuth()

  useEffect(() => {
    console.log('DebugAuthPage: Auth state', { user, role, isLoading, session })
  }, [user, role, isLoading, session])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>User: {user ? `Logged in (${user.id})` : 'Not logged in'}</p>
        <p>Role: {role || 'No role'}</p>
        <p>Email: {user?.email || 'No email'}</p>
        <p>Session: {session ? 'Active' : 'None'}</p>
      </div>
    </div>
  )
}