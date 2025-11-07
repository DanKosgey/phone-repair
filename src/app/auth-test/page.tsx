'use client'

import { AuthSystemTest } from '@/components/auth/AuthSystemTest'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthTestPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is already logged in, redirect to admin page
    if (!isLoading && user) {
      router.push('/admin')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Authentication Test</h1>
          <p className="text-muted-foreground mt-2">
            Diagnosing authentication system issues
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>User:</span>
              <span className="font-mono">{user ? user.email : 'Not logged in'}</span>
            </div>
            <div className="flex justify-between">
              <span>Loading:</span>
              <span className="font-mono">{isLoading ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
        
        <AuthSystemTest />
      </div>
    </div>
  )
}