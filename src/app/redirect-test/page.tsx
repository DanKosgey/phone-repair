'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function RedirectTestPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        console.log('RedirectTest: User is authenticated, redirecting to admin dashboard')
        router.push('/admin')
      } else {
        console.log('RedirectTest: No user, redirecting to login')
        router.push('/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirect Test</h1>
        <p>Testing redirect logic...</p>
        <div className="mt-4">
          <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}