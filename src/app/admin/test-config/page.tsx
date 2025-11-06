import { getBusinessConfig } from '@/lib/config-service'
import ClientTest from './client-test'

export default async function TestConfigPage() {
  const config = await getBusinessConfig()
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuration Test</h1>
      
      <div className="bg-card p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Server Configuration</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
      
      <ClientTest />
    </div>
  )
}