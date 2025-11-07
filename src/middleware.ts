import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Helper function to find auth cookies with various naming conventions
function findAuthCookie(cookies: { name: string; value: string }[], name: string): string | undefined {
  console.log('findAuthCookie: Looking for cookie', { 
    requestedName: name, 
    allCookies: cookies.map(c => c.name) 
  });
  
  // Try exact match first
  const exactMatch = cookies.find(c => c.name === name);
  if (exactMatch) {
    console.log('findAuthCookie: Found exact match', { name, value: exactMatch.value });
    return exactMatch.value;
  }
  
  // Try prefixed variations (sb-{projectRef}-auth-token)
  const prefixed = cookies.find(c => 
    c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );
  if (prefixed) {
    console.log('findAuthCookie: Found prefixed cookie', { name: prefixed.name, value: prefixed.value });
    return prefixed.value;
  }
  
  // Try backup cookie (sb-auth)
  const backup = cookies.find(c => c.name === 'sb-auth');
  if (backup) {
    console.log('findAuthCookie: Found backup cookie', { name: backup.name, value: backup.value });
    return backup.value;
  }
  
  console.log('findAuthCookie: No matching cookie found', { requestedName: name });
  return undefined;
}

export async function middleware(request: NextRequest) {
  console.log('Middleware: Processing request', {
    url: request.url,
    pathname: request.nextUrl.pathname
  });
  
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('CRITICAL: Supabase environment variables are missing!')
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Get hostname and determine environment
  const hostname = request.headers.get('host') || 'localhost'
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
  
  // Determine if we're on HTTPS
  const protocol = request.headers.get('x-forwarded-proto') || 'http'
  const isHttps = protocol === 'https:' || hostname.includes('.vercel.app') || hostname.includes('.netlify.app')

  console.log('Middleware: Environment info', { hostname, isLocalhost, protocol, isHttps });

  // FIX: Better cookie domain extraction
  let cookieDomain: string | undefined = undefined
  
  if (!isLocalhost) {
    const domainParts = hostname.split(':')[0].split('.')
    
    // For vercel.app or similar: use full domain
    if (hostname.includes('.vercel.app') || hostname.includes('.netlify.app')) {
      cookieDomain = hostname.split(':')[0]
    } 
    // For custom domains: use root domain
    else if (domainParts.length >= 2) {
      cookieDomain = `.${domainParts.slice(-2).join('.')}`
    }
  }

  console.log('Middleware: Cookie domain configuration', { cookieDomain });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const allCookies = request.cookies.getAll();
          const value = findAuthCookie(allCookies, name);
          
          console.log('Middleware: Reading cookie', { 
            requestedName: name, 
            value,
            allCookies: allCookies.map(c => c.name) 
          });
          return value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...options,
            sameSite: 'lax', // FIX: Always use 'lax' for better compatibility
            secure: isHttps,
            path: options.path || '/',
            domain: cookieDomain,
            httpOnly: options.httpOnly ?? true,
          }
          
          console.log('Middleware: Setting cookie', { name, value, cookieOptions });
          request.cookies.set({ name, value, ...cookieOptions })
          response = NextResponse.next({ 
            request: { headers: request.headers } 
          })
          response.cookies.set({ name, value, ...cookieOptions })
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...options,
            sameSite: 'lax',
            secure: isHttps,
            path: options.path || '/',
            domain: cookieDomain,
            maxAge: 0,
          }
          
          console.log('Middleware: Removing cookie', { name, cookieOptions });
          request.cookies.set({ name, value: '', ...cookieOptions })
          response = NextResponse.next({ 
            request: { headers: request.headers } 
          })
          response.cookies.set({ name, value: '', ...cookieOptions })
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      }
    }
  )

  // FIX: Protected routes check
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth') || 
                      request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/signup'
  
  const isPublicRoute = request.nextUrl.pathname === '/' ||
                        request.nextUrl.pathname.startsWith('/_next') ||
                        request.nextUrl.pathname.startsWith('/api/webhook')

  console.log('Middleware: Route classification', {
    pathname: request.nextUrl.pathname,
    isAuthRoute,
    isPublicRoute
  });

  // Only check session for protected routes
  if (!isAuthRoute && !isPublicRoute) {
    try {
      console.log('Middleware: Checking session for protected route');
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log('Middleware: Session check result', {
        hasSession: !!session,
        sessionUserId: session?.user?.id,
        error: error?.message
      });
      
      // FIX: Redirect to login if no session on protected route
      if (!session && !error) {
        console.log('Middleware: No session found, redirecting to login');
        const redirectUrl = new URL('/login', request.url)
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }
      
      if (error) {
        console.error('Middleware: Session error:', error.message)
      }
    } catch (error) {
      console.error('Middleware: Exception getting session:', error)
    }
  }

  // FIX: Don't set CORS headers in middleware (causes conflicts)
  // CORS should be handled by API routes only

  console.log('Middleware: Returning response');
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}