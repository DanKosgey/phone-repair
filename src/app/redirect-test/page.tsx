'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function RedirectTestPage() {
  const router = useRouter()
  const { user, role, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user && role === 'admin') {
        console.log('RedirectTest: User is admin, redirecting to admin dashboard')
        router.push('/admin')
      } else if (user) {
        console.log('RedirectTest: User is not admin, redirecting to home')
        router.push('/')
      } else {
        console.log('RedirectTest: No user, redirecting to login')
        router.push('/login')
      }
    }
  }, [user, role, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirect Test</h1>
        <p>Testing redirect logic...</p>
        <div className="mt-4">
          <p>User: {user ? 'Logged in' : 'Not logged in'}</p>
          <p>Role: {role || 'None'}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        </div>
      </div>
    </div>
  )
}
