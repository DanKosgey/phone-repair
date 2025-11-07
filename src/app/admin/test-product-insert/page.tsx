"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { Button } from '@/components/ui/button'

export default function TestProductInsertPage() {
  const { user } = useAuth()
  const [result, setResult] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const testInsert = async () => {
    if (!user) {
      setResult('You must be logged in to perform this test')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const supabase = getSupabaseBrowserClient()
      
      // Test data
      const testData = {
        name: 'Test Product',
        category: 'Test Category',
        description: 'This is a test product for debugging RLS issues',
        price: 99.99,
        stock_quantity: 10,
        image_url: 'https://example.com/test-image.jpg',
        is_featured: false,
        user_id: user.id, // Explicitly set the user_id
        slug: 'test-product'
      }

      console.log('Attempting to insert product with data:', testData)
      
      const { data, error } = await supabase
        .from('products')
        .insert(testData)
        .select()
        .single()

      if (error) {
        console.error('Insert error:', error)
        setResult(`Error: ${error.message}`)
      } else {
        console.log('Insert success:', data)
        setResult(`Success! Product ID: ${data.id}`)
        
        // Clean up - delete the test product
        if (data?.id) {
          await supabase
            .from('products')
            .delete()
            .eq('id', data.id)
        }
      }
    } catch (error: any) {
      console.error('Unexpected error:', error)
      setResult(`Unexpected error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Product Insert Test</h1>
      
      {user ? (
        <div className="space-y-4">
          <p>User ID: {user.id}</p>
          <p className="text-green-600">✓ You are authenticated and can access admin features</p>
          
          <Button 
            onClick={testInsert} 
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Product Insert'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p>Result: {result}</p>
            </div>
          )}
        </div>
      ) : (
        <p>You must be logged in to perform this test</p>
      )}
    </div>
  )
}