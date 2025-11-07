import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null

export function getSupabaseBrowserClient() {
  // Return existing client (singleton)
  if (browserClient) {
    return browserClient
  }

  // Only create in browser environment
  if (typeof window === 'undefined') {
    console.warn('Cannot create browser client during SSR')
    return null as any
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return null as any
  }

  // Validate URL
  try {
    new URL(supabaseUrl)
  } catch (e) {
    console.error('Invalid Supabase URL:', supabaseUrl)
    return null as any
  }

  browserClient = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined
          
          // Log all cookies for debugging
          console.log('BrowserClient: All document cookies', document.cookie);
          
          // Try to get the cookie with the exact name first
          let value = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
          
          console.log('BrowserClient: Reading cookie', { 
            requestedName: name, 
            value,
            hostname: window.location.hostname, 
            isLocalhost: window.location.hostname.includes('localhost') 
          });
          return value ? decodeURIComponent(value) : undefined
        },
        set(name: string, value: string, options) {
          if (typeof document === 'undefined') return
          
          try {
            let cookie = `${name}=${encodeURIComponent(value)}`
            
            if (options?.maxAge) {
              cookie += `; max-age=${options.maxAge}`
            }
            
            cookie += '; path=/'
            
            // Set domain only for production
            const hostname = window.location.hostname
            if (!hostname.includes('localhost')) {
              const domainParts = hostname.split('.')
              if (domainParts.length >= 2) {
                cookie += `; domain=.${domainParts.slice(-2).join('.')}`
              }
            }
            
            // Always use lax for better compatibility
            cookie += '; samesite=lax'
            
            if (window.location.protocol === 'https:') {
              cookie += '; secure'
            }
            
            console.log('BrowserClient: Setting cookie', { name, value, cookie });
            document.cookie = cookie
          } catch (error) {
            console.error('BrowserClient: Failed to set cookie:', error)
          }
        },
        remove(name: string, options) {
          if (typeof document === 'undefined') return
          
          try {
            const path = '; path=/'
            let cookie = `${name}=;${path}; max-age=0`
            console.log('BrowserClient: Removing cookie', { name, cookie });
            document.cookie = cookie
            
            // Remove with domain for production
            const hostname = window.location.hostname
            if (!hostname.includes('localhost')) {
              const domainParts = hostname.split('.')
              if (domainParts.length >= 2) {
                const domain = `.${domainParts.slice(-2).join('.')}`
                cookie = `${name}=;${path}; domain=${domain}; max-age=0`
                console.log('BrowserClient: Removing cookie with domain', { name, cookie });
                document.cookie = cookie
              }
            }
          } catch (error) {
            console.error('BrowserClient: Failed to remove cookie:', error)
          }
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'sb-auth-token',
        flowType: 'pkce',
      }
    }
  )

  return browserClient
}