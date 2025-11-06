import { createBrowserClient, type CookieOptions } from '@supabase/ssr'

let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  // Return existing client if already created (singleton pattern)
  if (browserClient) {
    return browserClient
  }

  // Verify environment variables exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  browserClient = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          // Handle cookie retrieval safely
          if (typeof document === 'undefined') return undefined
          
          const value = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1]
          
          return value ? decodeURIComponent(value) : undefined
        },
        set(name: string, value: string, options: CookieOptions) {
          // Handle cookie setting safely
          if (typeof document === 'undefined') return
          
          try {
            // Ensure proper encoding
            const encodedValue = encodeURIComponent(value)
            let cookie = `${name}=${encodedValue}`
            
            // Set proper cookie attributes
            if (options?.maxAge) {
              cookie += `; max-age=${options.maxAge}`
            }
            // Always set path to root
            cookie += '; path=/'
            
            if (options?.domain) {
              cookie += `; domain=${options.domain}`
            }
            // Set SameSite attribute properly
            if (options?.sameSite) {
              cookie += `; samesite=${options.sameSite}`
            } else {
              // Default to Lax for better security and compatibility
              cookie += '; samesite=Lax'
            }
            // Set Secure attribute properly
            if (options?.secure !== undefined) {
              cookie += options.secure ? '; secure' : ''
            } else {
              // Default to secure in production (HTTPS)
              cookie += (typeof window !== 'undefined' && window.location.protocol === 'https:') ? '; secure' : ''
            }
            
            document.cookie = cookie
          } catch (error) {
            console.warn('Failed to set cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          // Handle cookie removal safely
          if (typeof document === 'undefined') return
          
          try {
            // Always use root path for removal
            const path = '; path=/'
            const domain = options?.domain || (typeof window !== 'undefined' ? window.location.hostname : '')
            // Remove cookie with proper domain handling
            document.cookie = `${name}=;${path}; max-age=0`
            if (domain) {
              document.cookie = `${name}=;${path}; domain=${domain}; max-age=0`
              document.cookie = `${name}=;${path}; domain=.${domain}; max-age=0`
            }
          } catch (error) {
            console.warn('Failed to remove cookie:', error)
          }
        },
      },
    }
  )

  return browserClient
}