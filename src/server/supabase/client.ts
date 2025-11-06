import { createBrowserClient } from '@supabase/ssr'

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
          
          return value
        },
        set(name: string, value: string, options: any) {
          // Handle cookie setting safely
          if (typeof document === 'undefined') return
          
          try {
            let cookie = `${name}=${value}`
            
            if (options?.maxAge) {
              cookie += `; max-age=${options.maxAge}`
            }
            if (options?.path) {
              cookie += `; path=${options.path}`
            }
            if (options?.sameSite) {
              cookie += `; samesite=${options.sameSite}`
            }
            if (options?.secure) {
              cookie += '; secure'
            }
            
            document.cookie = cookie
          } catch (error) {
            console.warn('Failed to set cookie:', error)
          }
        },
        remove(name: string, options: any) {
          // Handle cookie removal safely
          if (typeof document === 'undefined') return
          
          try {
            const path = options?.path || '/'
            document.cookie = `${name}=; path=${path}; max-age=0`
          } catch (error) {
            console.warn('Failed to remove cookie:', error)
          }
        },
      },
    }
  )

  return browserClient
}