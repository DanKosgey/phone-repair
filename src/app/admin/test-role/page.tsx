"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getSupabaseBrowserClient } from '@/server/supabase/client'

export default function TestRolePage() {
  const { user, role, isLoading } = useAuth()
  const [dbRole, setDbRole] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDbRole = async () => {
      if (!user) return
      
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (error) {
          setError(error.message)
        } else {
          setDbRole(data?.role || null)
        }
      } catch (err: any) {
        setError(err.message)
      }
    }
    
    if (user && !isLoading) {
      fetchDbRole()
    }
  }, [user, isLoading])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Role Test</h1>
      
      {user ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Auth Context</h2>
            <p>User ID: {user.id}</p>
            <p>Role from context: {role || 'null'}</p>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold">Database Check</h2>
            <p>Role from database: {dbRole || 'null'}</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p>Error: {error}</p>
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold">Comparison</h2>
            {role === dbRole ? (
              <p className="text-green-600">✓ Roles match</p>
            ) : (
              <p className="text-red-600">✗ Roles do not match</p>
            )}
          </div>
        </div>
      ) : (
        <p>You are not logged in</p>
      )}
    </div>
  )
}