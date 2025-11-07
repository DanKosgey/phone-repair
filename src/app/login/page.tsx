'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Lock } from 'lucide-react'
import Link from 'next/link'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { signIn, user, role, isLoading: authLoading, isFetchingRole } = useAuth()
  const hasRedirected = useRef(false)
  const mountedRef = useRef(true)

  // Clear timeout on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    console.log('LoginPage: Auth state updated', { 
      userId: user?.id, 
      role, 
      authLoading,
      isFetchingRole,
      hasRedirected: hasRedirected.current,
      mounted: mountedRef.current
    })
    
    // If user is authenticated and role is loaded, redirect based on role - one way flow
    if (!authLoading && user && !isFetchingRole && !hasRedirected.current && mountedRef.current) {
      console.log('LoginPage: User is authenticated and role is loaded, preparing redirect', { 
        role, 
        userId: user.id 
      })
      
      // Only redirect if we're not already redirecting
      if (!hasRedirected.current) {
        hasRedirected.current = true
        if (role === 'admin') {
          console.log('LoginPage: User authenticated as admin, redirecting to admin dashboard')
          router.push('/admin')
        } else if (role !== null) {
          console.log('LoginPage: User authenticated but not admin, redirecting to homepage')
          router.push('/')
        } else {
          // If role is null but user exists, redirect to admin (assume admin)
          console.log('LoginPage: Role not yet loaded, redirecting to admin dashboard')
          router.push('/admin')
        }
      }
    } else if (!authLoading && user && hasRedirected.current) {
      console.log('LoginPage: User is authenticated but already redirected', { 
        role, 
        userId: user.id 
      })
    } else if (authLoading) {
      console.log('LoginPage: Still loading authentication state')
    } else if (!user) {
      console.log('LoginPage: No user authenticated')
    } else if (!authLoading && user && isFetchingRole) {
      console.log('LoginPage: User authenticated but still fetching role', { 
        userId: user.id 
      })
    }
  }, [user, role, authLoading, isFetchingRole, router])

  // Effect to monitor role changes specifically
  useEffect(() => {
    console.log('LoginPage: Role updated', role)
    if (role === 'admin' && !authLoading && user && !hasRedirected.current && mountedRef.current) {
      console.log('LoginPage: Admin role confirmed, redirecting to admin dashboard')
      hasRedirected.current = true
      router.push('/admin')
    } else if (role !== null && role !== 'admin' && !authLoading && user && !hasRedirected.current && mountedRef.current) {
      console.log('LoginPage: Non-admin role confirmed, redirecting to homepage')
      hasRedirected.current = true
      router.push('/')
    } else if (role === null && !authLoading && user && !hasRedirected.current && mountedRef.current) {
      console.log('LoginPage: Role is null but user is authenticated, redirecting to admin dashboard')
      hasRedirected.current = true
      router.push('/admin')
    }
  }, [role, user, authLoading, router])
  
  // Separate effect for handling timeout when role doesn't load
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    
    if (!authLoading && user && !hasRedirected.current && mountedRef.current) {
      console.log('LoginPage: Setting timeout for role loading')
      timeoutId = setTimeout(() => {
        if (!hasRedirected.current && mountedRef.current) {
          console.log('LoginPage: Timeout waiting for role, redirecting anyway')
          hasRedirected.current = true
          router.push('/admin')
        }
      }, 5000) // 5 second timeout
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user, authLoading, router, role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LoginPage: Submitting login form for email:', email);
    setIsSubmitting(true);
    setError('');

    if (!email || !password) {
      console.log('LoginPage: Missing email or password');
      setError('Please enter both email and password');
      setIsSubmitting(false);
      return;
    }

    console.log('LoginPage: Attempting sign in for:', email);
    try {
      // Reset redirect flag before signing in
      hasRedirected.current = false;
      
      console.log('LoginPage: Calling signIn function');
      await signIn(email, password);
      console.log('LoginPage: Sign in function completed');
      // Redirect will be handled by the useEffect above
    } catch (error: any) {
      console.error('LoginPage: Sign in failed:', error);
      setError(error.message || 'An unexpected error occurred');
      // Reset redirect flag on error so user can try again
      hasRedirected.current = false;
    } finally {
      // Only set isSubmitting to false if we haven't redirected
      if (!hasRedirected.current) {
        console.log('LoginPage: Setting isSubmitting to false');
        setIsSubmitting(false);
      }
    }
  }

  // If user is already logged in, show loading state
  if (authLoading || (user && !hasRedirected.current)) {
    console.log('LoginPage: Showing loading state')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Authenticating...</p>
          {authLoading && (
            <p className="text-sm text-muted-foreground">Please wait...</p>
          )}
        </div>
      </div>
    )
  }

  console.log('LoginPage: Rendering login form')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Lock className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={isSubmitting || authLoading}>
              {(isSubmitting || authLoading) ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link href="/" className="text-primary hover:underline">
                Back to main site
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}