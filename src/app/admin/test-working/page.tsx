'use client'

import { useState, useEffect } from 'react'

export default function TestWorkingPage() {
  const [status, setStatus] = useState('Component loaded')

  useEffect(() => {
    setStatus('Component mounted successfully')
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Working Page</h1>
      <p>{status}</p>
      <div className="mt-4 p-4 bg-green-100 rounded-lg">
        <p>If you can see this page, the admin routing is working correctly.</p>
      </div>
    </div>
  )
}