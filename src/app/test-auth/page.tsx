'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export default function TestAuthPage() {
  const { user, isLoading, signIn, signOut } = useAuth()
  const router = useRouter()
  const [testEmail, setTestEmail] = useState('')
  const [testPassword, setTestPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    console.log('TestAuth: Auth state updated', { 
      userId: user?.id, 
      isLoading
    })
  }, [user, isLoading])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult('')
    setError('')
    
    try {
      console.log('TestAuth: Attempting sign in')
      await signIn(testEmail, testPassword)
      setResult('Sign in successful!')
      console.log('TestAuth: Sign in completed')
    } catch (err: any) {
      console.error('TestAuth: Sign in error:', err)
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    try {
      console.log('TestAuth: Attempting sign out')
      await signOut()
      setResult('Sign out successful!')
      console.log('TestAuth: Sign out completed')
    } catch (err: any) {
      console.error('TestAuth: Sign out error:', err)
      setError(err.message || 'Sign out failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToAdmin = () => {
    console.log('TestAuth: Navigating to admin')
    router.push('/admin')
  }

  const handleGoToLogin = () => {
    console.log('TestAuth: Navigating to login')
    router.push('/login')
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Authentication Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">User ID:</p>
              <p className="text-sm">{user?.id || 'None'}</p>
            </div>
            <div>
              <p className="font-medium">Email:</p>
              <p className="text-sm">{user?.email || 'None'}</p>
            </div>
            <div>
              <p className="font-medium">Status:</p>
              <p className="text-sm">{user ? 'Authenticated' : 'Not authenticated'}</p>
            </div>
            <div>
              <p className="font-medium">Loading:</p>
              <p className="text-sm">{isLoading ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {!user ? (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Sign In Test</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="testEmail"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="testPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="testPassword"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={handleGoToLogin}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Login Page
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Authenticated Actions</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Signing out...' : 'Sign Out'}
              </button>
              <button
                onClick={handleGoToAdmin}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Go to Admin Dashboard
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
            {result}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          <h3 className="font-medium mb-2">Test Information</h3>
          <p className="text-sm">
            This page helps test authentication flow in production. If you're experiencing infinite loading after sign in,
            check the browser console for error messages and try the actions above.
          </p>
        </div>
      </div>
    </div>
  )
}