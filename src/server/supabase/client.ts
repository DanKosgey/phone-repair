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

  // Check if we're in a browser environment during runtime (not build time)
  if (typeof window === 'undefined') {
    // During server-side rendering/build, we can't access env vars the same way
    console.warn('Supabase client initialized during SSR/build - env vars may not be available yet')
    // Return a minimal client that will be replaced during hydration
    return null as any
  }

  // If we don't have the required environment variables, return null
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Returning null client.')
    return null as any
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (e) {
    console.warn(`Invalid Supabase URL format: ${supabaseUrl}. Returning null client.`)
    return null as any
  }

  // Determine if we're in a browser environment and if it's HTTPS
  const isBrowser = typeof window !== 'undefined'
  const isHttps = isBrowser && window.location.protocol === 'https:'

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
            } else {
              // For production, explicitly set domain to avoid issues
              const hostname = isBrowser ? window.location.hostname : ''
              if (hostname && !hostname.includes('localhost')) {
                cookie += `; domain=.${hostname.split('.').slice(-2).join('.')}`
              }
            }
            // Set SameSite attribute properly
            if (options?.sameSite) {
              cookie += `; samesite=${options.sameSite}`
            } else {
              // Default to lax for better security and compatibility
              cookie += '; samesite=lax'
            }
            // Set Secure attribute properly
            if (options?.secure !== undefined) {
              cookie += options.secure ? '; secure' : ''
            } else {
              // Default to secure in production (HTTPS)
              cookie += isHttps ? '; secure' : ''
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
            const domain = options?.domain || (isBrowser ? window.location.hostname : '')
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
      // Add auth settings to prevent infinite refresh loops
      auth: {
        // Prevent automatic session refresh which can cause loops
        // Match the middleware setting
        autoRefreshToken: false,
        // Persist session in localStorage
        persistSession: true,
        // Detect auth changes via polling to avoid race conditions
        detectSessionInUrl: true,
      }
    }
  )

  return browserClient
}