import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
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
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ 
            request: { headers: request.headers } 
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ 
            request: { headers: request.headers } 
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Don't refresh session on auth routes to prevent re-login
  const isAuthRoute = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname === '/signup'
  
  if (!isAuthRoute) {
    try {
      await supabase.auth.getSession()
    } catch (error) {
      console.error('Middleware: Error refreshing session:', error)
    }
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true')
  
  const cookies = request.cookies.getAll()
  cookies.forEach(cookie => {
    if (cookie.name.startsWith('__cf_')) {
      try {
        response.cookies.delete(cookie.name)
      } catch (error) {
        // Silently fail
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