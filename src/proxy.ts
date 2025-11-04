import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  console.log('Proxy: Processing request for', request.nextUrl.pathname);
  
  console.log('Proxy: Request cookies:', Object.fromEntries(request.cookies));
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set the cookie on the response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove the cookie from the response
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Proxy: Error getting session:', error);
  }
  
  console.log('Proxy: Session status', session ? 'Authenticated' : 'Not authenticated');
  if (session) {
    console.log('Proxy: Session user ID:', session.user?.id);
  }
  
  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('Proxy: Admin route detected, checking authentication');
    
    if (!session) {
      console.log('Proxy: No session found, redirecting to login');
      // Store the intended destination for redirect after login
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    try {
      // Check if user is admin
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      console.log('Proxy: Profile check result', { profile, error });
      
      if (error) {
        console.error('Proxy: Error fetching profile:', error);
        // If there's a network error or any error, allow access but log it
        // This prevents redirect loops and lets client-side handle auth properly
        console.log('Proxy: Error fetching profile, allowing access for now');
      } else if (profile?.role !== 'admin') {
        console.log('Proxy: User not admin, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url))
      } else {
        console.log('Proxy: User is admin, allowing access to admin route');
      }
    } catch (error) {
      console.error('Proxy: Error checking user role:', error);
      // If there's an error checking the role, allow access but log it
      console.log('Proxy: Error checking role, allowing access for now');
      // We'll let the client-side handle authentication in this case
    }
  }

  // Redirect logged-in admin users away from login page
  if (request.nextUrl.pathname === '/login' && session) {
    try {
      // Check if user is admin
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Proxy: Error fetching profile on login page:', error);
        // If there's a network error, don't redirect but allow client-side to handle it
        if (error.message && error.message.includes('fetch failed')) {
          console.log('Proxy: Network error on login page, not redirecting');
        }
      } else if (profile?.role === 'admin') {
        console.log('Proxy: Admin user on login page, redirecting to admin dashboard');
        // Check if there's a redirectTo parameter
        const redirectTo = request.nextUrl.searchParams.get('redirectTo');
        if (redirectTo && redirectTo.startsWith('/admin')) {
          return NextResponse.redirect(new URL(redirectTo, request.url));
        }
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch (error) {
      console.error('Proxy: Error checking user role on login page:', error);
      // If there's an error checking the role, don't redirect but allow client-side to handle it
      console.log('Proxy: Error checking role on login page, not redirecting');
    }
  }
  
  console.log('Proxy: Returning response');
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
};