import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not available during middleware execution')
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

  // Get the hostname from the request
  const hostname = request.headers.get('host') || 'localhost'
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Determine if we're on HTTPS (for production)
  const isHttps = request.headers.get('x-forwarded-proto') === 'https' || 
                  request.nextUrl.protocol === 'https:' ||
                  hostname.includes('.vercel.app') ||
                  isProduction

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set proper cookie options for production
          const cookieOptions: CookieOptions = {
            ...options,
            // Ensure proper SameSite setting
            sameSite: options?.sameSite || 'lax',
            // Ensure secure setting for HTTPS
            secure: options?.secure ?? isHttps,
            // Ensure path is set
            path: options?.path || '/',
          }
          
          request.cookies.set({ name, value, ...cookieOptions })
          response = NextResponse.next({ 
            request: { headers: request.headers } 
          })
          response.cookies.set({ name, value, ...cookieOptions })
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...options,
            // Ensure proper settings for removal
            sameSite: options?.sameSite || 'lax',
            secure: options?.secure ?? isHttps,
            path: options?.path || '/',
            maxAge: 0,
          }
          
          request.cookies.set({ name, value: '', ...cookieOptions })
          response = NextResponse.next({ 
            request: { headers: request.headers } 
          })
          response.cookies.set({ name, value: '', ...cookieOptions })
        },
      },
      // Add auth settings to prevent infinite refresh loops
      auth: {
        // Prevent automatic session refresh which can cause loops
        autoRefreshToken: true,
        // Persist session in cookies
        persistSession: true,
        // Detect auth changes via polling to avoid race conditions
        detectSessionInUrl: true,
      }
    }
  )

  // Don't refresh session on auth routes to prevent re-login
  const isAuthRoute = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/signup'
  
  // Also don't refresh session on admin routes to prevent interference
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  
  if (!isAuthRoute && !isAdminRoute) {
    try {
      await supabase.auth.getSession()
    } catch (error) {
      console.error('Middleware: Error refreshing session:', error)
    }
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  // Handle Cloudflare cookies properly - only remove specific problematic ones
  const cookies = request.cookies.getAll()
  cookies.forEach(cookie => {
    // Remove specific Cloudflare cookies that can cause issues with Supabase auth
    if (cookie.name === '__cf_bm' || cookie.name === '__cfduid') {
      try {
        response.cookies.delete(cookie.name)
      } catch (error) {
        console.warn(`Failed to remove Cloudflare cookie ${cookie.name}:`, error)
      }
    }
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}