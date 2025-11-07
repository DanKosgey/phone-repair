'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { useAuth } from '@/contexts/auth-context'

export function AuthSystemTest() {
  const [testResults, setTestResults] = useState<{
    envVars: boolean
    supabaseClient: boolean
    authProvider: boolean
    sessionCheck: boolean
    profilesTable: boolean
  }>({
    envVars: false,
    supabaseClient: false,
    authProvider: false,
    sessionCheck: false,
    profilesTable: false,
  })

  const auth = useAuth()

  useEffect(() => {
    const runTests = async () => {
      const results = { ...testResults }

      // Test 1: Environment variables
      results.envVars = !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      console.log('✓ Test 1 - Env vars:', results.envVars)

      // Test 2: Supabase client
      try {
        const supabase = getSupabaseBrowserClient()
        results.supabaseClient = !!supabase
        console.log('✓ Test 2 - Supabase client:', results.supabaseClient)

        // Test 3: Session check
        const { data, error } = await supabase.auth.getSession()
        results.sessionCheck = !error
        console.log('✓ Test 3 - Session check:', results.sessionCheck, error?.message || 'OK')

        // Test 4: Profiles table access
        const { error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
        results.profilesTable = !profileError
        console.log('✓ Test 4 - Profiles table:', results.profilesTable, profileError?.message || 'OK')
      } catch (error: any) {
        console.error('Test error:', error)
      }

      // Test 5: Auth provider
      results.authProvider = !!auth
      console.log('✓ Test 5 - Auth provider:', results.authProvider)

      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-card border rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth System Status</h3>
      <div className="space-y-1 text-sm">
        <div className={testResults.envVars ? 'text-green-600' : 'text-red-600'}>
          {testResults.envVars ? '✓' : '✗'} Environment Variables
        </div>
        <div className={testResults.supabaseClient ? 'text-green-600' : 'text-red-600'}>
          {testResults.supabaseClient ? '✓' : '✗'} Supabase Client
        </div>
        <div className={testResults.authProvider ? 'text-green-600' : 'text-red-600'}>
          {testResults.authProvider ? '✓' : '✗'} Auth Provider
        </div>
        <div className={testResults.sessionCheck ? 'text-green-600' : 'text-red-600'}>
          {testResults.sessionCheck ? '✓' : '✗'} Session Check
        </div>
        <div className={testResults.profilesTable ? 'text-green-600' : 'text-red-600'}>
          {testResults.profilesTable ? '✓' : '✗'} Profiles Table
        </div>
      </div>
      <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
        User: {auth.user?.email || 'Not logged in'}<br />
        Status: {auth.user ? 'Authenticated' : 'Not authenticated'}<br />
        Loading: {auth.isLoading ? 'Yes' : 'No'}
      </div>
    </div>
  )
}