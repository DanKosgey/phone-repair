"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { getBusinessConfig, saveBusinessConfig } from '@/lib/config-service'

export default function ClientTest() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      setLoading(true)
      const config = await getBusinessConfig()
      setConfig(config)
    } catch (error) {
      console.error('Error loading config:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = async () => {
    try {
      setSaving(true)
      await saveBusinessConfig({ businessName: "Updated Shop Name" })
      await loadConfig()
    } catch (error) {
      console.error('Error updating config:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Client Configuration Test</h1>
      <div className="bg-card p-4 rounded-lg mb-4">
        <h2 className="text-xl font-semibold mb-2">Current Configuration</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
      <Button onClick={updateConfig} disabled={saving}>
        {saving ? 'Saving...' : 'Update Business Name'}
      </Button>
      <Button onClick={loadConfig} className="ml-2">
        Refresh
      </Button>
    </div>
  )
}