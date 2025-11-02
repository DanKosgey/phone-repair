'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/server/supabase/client'

export default function DebugSupabasePage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testSupabaseConnection = async () => {
      try {
        setLoading(true)
        const supabase = getSupabaseBrowserClient()
        
        // Test basic connection by fetching user count
        const { data, error } = await supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .limit(1)

        if (error) {
          throw new Error(`Supabase error: ${error.message}`)
        }

        setTestResult({
          status: 'success',
          message: 'Supabase connection successful',
          data
        })
      } catch (err: any) {
        console.error('DebugSupabasePage: Error:', err)
        setError(err.message || 'Unknown error')
        setTestResult({
          status: 'error',
          message: err.message || 'Unknown error'
        })
      } finally {
        setLoading(false)
      }
    }

    testSupabaseConnection()
  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {loading ? (
        <div className="p-4 bg-gray-100 rounded">Testing Supabase connection...</div>
      ) : error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="font-bold">Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h2 className="font-bold">Success</h2>
          <p>{testResult?.message}</p>
          <pre className="mt-2 text-xs overflow-x-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}