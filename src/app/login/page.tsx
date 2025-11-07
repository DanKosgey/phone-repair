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
  const { signIn, user, isLoading: authLoading } = useAuth()
  const hasRedirected = useRef(false)

  // Handle initial redirect if already authenticated
  useEffect(() => {
    console.log('LoginPage: Auth state updated', { 
      userId: user?.id, 
      authLoading,
      hasRedirected: hasRedirected.current
    })
    
    // Only redirect ONCE
    if (user && !authLoading && !hasRedirected.current) {
      console.log('LoginPage: User already authenticated, preparing redirect', {
        userId: user.id,
        email: user.email,
        hasRedirected: hasRedirected.current
      })
      hasRedirected.current = true
      console.log('LoginPage: Setting redirect timeout')
      // Add a small delay to ensure state propagation
      setTimeout(() => {
        console.log('LoginPage: Executing redirect to /admin')
        try {
          // Use router.push for client-side navigation
          router.push('/admin')
          console.log('LoginPage: Router push command sent successfully')
        } catch (error) {
          console.error('LoginPage: Error during redirect', error)
        }
      }, 100)
    } else if (user && !authLoading && hasRedirected.current) {
      console.log('LoginPage: User authenticated but already redirected, skipping redirect', {
        userId: user.id,
        hasRedirected: hasRedirected.current
      })
    } else if (!user && !authLoading) {
      console.log('LoginPage: No user authenticated, showing login form')
      // Reset redirect flag when user logs out or session expires
      hasRedirected.current = false
    }
  }, [user, authLoading, router])

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
      console.log('LoginPage: Resetting redirect flag before sign in');
      hasRedirected.current = false;
      
      console.log('LoginPage: Calling signIn function');
      await signIn(email, password);
      console.log('LoginPage: Sign in function completed successfully');
      
      // Note: The redirect will happen in the useEffect when the auth state updates
      // We don't need to manually redirect here since the onAuthStateChange listener
      // will update the user state and trigger the redirect in the useEffect above
    } catch (error: any) {
      console.error('LoginPage: Sign in failed:', error);
      setError(error.message || 'An unexpected error occurred');
      // Reset redirect flag on error so user can try again
      console.log('LoginPage: Sign in failed, resetting redirect flag');
      hasRedirected.current = false;
      setIsSubmitting(false);
    }
  }

  // Don't render the form if we're already authenticated and redirecting
  if (user && !authLoading) {
    console.log('LoginPage: User authenticated, showing redirect UI', {
      userId: user.id,
      hasRedirected: hasRedirected.current
    })
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Redirecting to admin dashboard...</p>
        </div>
      </div>
    )
  }

  // If user is already logged in, show loading state
  if (authLoading) {
    console.log('LoginPage: Showing loading state - auth is loading')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    )
  }

  console.log('LoginPage: Rendering login form - no user, not loading')
  
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