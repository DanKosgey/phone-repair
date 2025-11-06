'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

// Separate component for the login form that uses useSearchParams
function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, role, isLoading: authLoading, isFetchingRole } = useAuth();
  const hasRedirected = useRef(false);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);
  const [roleCheckAttempts, setRoleCheckAttempts] = useState(0);

  useEffect(() => {
    console.log('LoginPage: Auth state updated', { 
      userId: user?.id, 
      role, 
      authLoading,
      isFetchingRole,
      roleCheckAttempts,
      shouldRedirect: !authLoading && !isFetchingRole && user && (role === 'admin' || role === null)
    });
    
    // Clear any existing timeout
    if (redirectTimeout.current) {
      clearTimeout(redirectTimeout.current);
    }
    
    // If we're still loading auth or waiting for role, don't redirect yet
    if (authLoading || isFetchingRole) {
      return;
    }
    
    // If user is authenticated and we have the role, redirect appropriately
    if (user && role === 'admin' && !hasRedirected.current) {
      console.log('LoginPage: User authenticated as admin, redirecting to admin dashboard');
      hasRedirected.current = true;
      // Check if there's a redirectTo parameter
      const redirectTo = searchParams.get('redirectTo');
      if (redirectTo && redirectTo.startsWith('/admin')) {
        router.push(redirectTo);
      } else {
        router.push('/admin');
      }
    } else if (user && role !== 'admin' && role !== null && !hasRedirected.current) {
      console.log('LoginPage: User authenticated but not admin, role:', role);
      // For non-admin users, redirect to homepage
      hasRedirected.current = true;
      router.push('/');
    } else if (!user && !authLoading) {
      console.log('LoginPage: No user authenticated');
      // Reset redirect flag when user logs out
      hasRedirected.current = false;
      setRoleCheckAttempts(0);
    }
    
    // Add a timeout to prevent infinite waiting for role
    if (user && !hasRedirected.current) {
      redirectTimeout.current = setTimeout(() => {
        if (!hasRedirected.current) {
          console.log('LoginPage: Redirect timeout reached, forcing redirect based on available data, attempt:', roleCheckAttempts + 1);
          if (role === 'admin') {
            hasRedirected.current = true;
            const redirectTo = searchParams.get('redirectTo');
            if (redirectTo && redirectTo.startsWith('/admin')) {
              router.push(redirectTo);
            } else {
              router.push('/admin');
            }
          } else if (role !== null) {
            // Role is explicitly not admin
            hasRedirected.current = true;
            router.push('/');
          } else {
            // Role is still null, but we have a user
            // If we've tried multiple times, assume admin for safety since they're trying to access login
            if (roleCheckAttempts >= 2) {
              console.log('LoginPage: Multiple attempts failed, assuming admin role for redirect');
              hasRedirected.current = true;
              const redirectTo = searchParams.get('redirectTo');
              if (redirectTo && redirectTo.startsWith('/admin')) {
                router.push(redirectTo);
              } else {
                router.push('/admin');
              }
            } else {
              // Increment attempts and try again
              setRoleCheckAttempts(prev => prev + 1);
            }
          }
        }
      }, 3000); // 3 second timeout
    }
  }, [user, role, authLoading, isFetchingRole, router, searchParams, roleCheckAttempts]);

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
      // Clear any existing timeout
      if (redirectTimeout.current) {
        clearTimeout(redirectTimeout.current);
      }
      // Reset role check attempts
      setRoleCheckAttempts(0);
      
      await signIn(email, password);
      console.log('LoginPage: Sign in successful');
      
      // Small delay to ensure role is properly set
      setTimeout(() => {
        // Check if there's a redirectTo parameter
        const redirectTo = searchParams.get('redirectTo');
        if (redirectTo && redirectTo.startsWith('/admin')) {
          console.log('LoginPage: Redirecting to:', redirectTo);
          router.push(redirectTo);
        } else {
          console.log('LoginPage: Redirecting to default admin dashboard');
          router.push('/admin');
        }
      }, 100);
    } catch (error: any) {
      console.error('LoginPage: Sign in failed:', error);
      console.error('LoginPage: Error stack:', error.stack);
      setError(error.message || 'An unexpected error occurred');
    }
    
    setIsSubmitting(false);
  };

  // If user is already logged in, show loading state or redirect
  if (authLoading || isFetchingRole) {
    console.log('LoginPage: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Authenticating...</p>
          {roleCheckAttempts > 0 && (
            <p className="text-sm text-muted-foreground">Taking longer than expected... (Attempt {roleCheckAttempts + 1})</p>
          )}
        </div>
      </div>
    );
  }

  console.log('LoginPage: Rendering login form');
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
  );
}

// Main component that wraps the login form in a Suspense boundary
export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}