'use client'

import { useAuth } from '@/contexts/auth-context'
import { useEffect, useState } from 'react'

export default function AuthDebugSession() {
  const { user, session, isLoading } = useAuth()
  const [storageInfo, setStorageInfo] = useState<any>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const info: any = {}
      
      // Check localStorage
      try {
        info.localStorage = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('sb-') || key.includes('supabase'))) {
            info.localStorage[key] = localStorage.getItem(key)
          }
        }
      } catch (e) {
        info.localStorageError = e.message
      }
      
      // Check sessionStorage
      try {
        info.sessionStorage = {}
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('sb-') || key.includes('supabase'))) {
            info.sessionStorage[key] = sessionStorage.getItem(key)
          }
        }
      } catch (e) {
        info.sessionStorageError = e.message
      }
      
      // Check cookies
      try {
        info.cookies = {}
        const cookies = document.cookie.split(';')
        cookies.forEach(cookie => {
          const [name, value] = cookie.trim().split('=')
          if (name && (name.includes('sb-') || name.includes('supabase'))) {
            info.cookies[name] = value
          }
        })
      } catch (e) {
        info.cookiesError = e.message
      }
      
      setStorageInfo(info)
    }
  }, [])

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Authentication Debug Information</h1>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Auth Context State</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify({ user, session, isLoading }, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Storage Information</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(storageInfo, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Document Cookies</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {typeof document !== 'undefined' ? document.cookie : 'Not available'}
        </pre>
      </div>
    </div>
  )
}