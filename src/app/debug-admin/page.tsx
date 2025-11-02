'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Dashboard from "@/components/admin/Dashboard"

export default function DebugAdminPage() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('DebugAdminPage: Checking authentication', { user: !!user, role, isLoading })
  }, [user, role, isLoading])

  if (isLoading) {
    console.log('DebugAdminPage: Showing loading state')
    return <div className="p-6">Loading...</div>
  }

  if (!user || role !== 'admin') {
    console.log('DebugAdminPage: Unauthorized access')
    return <div className="p-6">Unauthorized access. You must be an admin to view this page.</div>
  }

  console.log('DebugAdminPage: Rendering dashboard component')
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Debug Admin Page</h1>
      <div className="border p-4 rounded">
        <Dashboard />
      </div>
    </div>
  )
}