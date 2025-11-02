'use client'

import { useState, useEffect } from 'react'
import Dashboard from "@/pages/admin/Dashboard"
import { useAuth } from '@/contexts/auth-context'

export default function DebugDashboardPage() {
  const { user, role, isLoading } = useAuth()
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    console.log('DebugDashboardPage: Auth state', { user: !!user, role, isLoading })
  }, [user, role, isLoading])

  if (isLoading) {
    return <div className="p-6">Loading authentication...</div>
  }

  if (!user) {
    return <div className="p-6">You must be logged in to view this page.</div>
  }

  if (role !== 'admin') {
    return <div className="p-6">You must be an admin to view this page. Your role is: {role}</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard Component Test</h1>
      <div className="mb-4 p-4 bg-blue-50 rounded">
        <p className="mb-2"><strong>Auth Status:</strong></p>
        <p>User ID: {user.id}</p>
        <p>Email: {user.email}</p>
        <p>Role: {role}</p>
      </div>
      
      <button 
        onClick={() => setShowDashboard(!showDashboard)}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {showDashboard ? 'Hide' : 'Show'} Dashboard
      </button>
      
      {showDashboard && (
        <div className="border-2 border-dashed p-4 rounded">
          <Dashboard />
        </div>
      )}
    </div>
  )
}