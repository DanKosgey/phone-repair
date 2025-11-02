"use client"

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { productsDb } from '@/lib/db/products'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function TestAdminProductPage() {
  const { user, role, isLoading } = useAuth()
  const [result, setResult] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const testCreateProduct = async () => {
    if (!user || role !== 'admin') {
      setResult('You must be an admin to create products')
      return
    }

    setIsCreating(true)
    setResult(null)

    try {
      // Test data
      const testData = {
        name: 'Test Product - Admin Verification',
        category: 'Test Category',
        description: 'This is a test product to verify admin RLS policies are working correctly',
        price: 99.99,
        stock_quantity: 5,
        image_url: 'https://example.com/test-image.jpg',
        is_featured: false,
        slug: 'test-product-admin-verification'
      }

      console.log('Attempting to create product with data:', testData)
      
      const result = await productsDb.create(testData)
      console.log('Product created successfully:', result)
      
      setResult(`Success! Product created with ID: ${result.id}`)
      
      // Redirect to the new product page after a short delay
      setTimeout(() => {
        router.push(`/admin/products/${result.id}`)
      }, 2000)
    } catch (error: any) {
      console.error('Error creating product:', error)
      setResult(`Error: ${error.message}`)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading authentication...</div>
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Product Creation Test</h1>
      
      {user ? (
        <div className="space-y-6">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">User Information</h2>
            <p>User ID: {user.id}</p>
            <p>Role: {role || 'null'}</p>
            <p className={role === 'admin' ? 'text-green-600' : 'text-red-600'}>
              {role === 'admin' ? '✓ You have admin privileges' : '✗ You do not have admin privileges'}
            </p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Test Product Creation</h2>
            <p>This test will attempt to create a product using the fixed productsDb.create function.</p>
            
            <Button 
              onClick={testCreateProduct} 
              disabled={isCreating || role !== 'admin'}
              className="mt-4"
            >
              {isCreating ? 'Creating Product...' : 'Test Create Product'}
            </Button>
          </div>
          
          {result && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <p>Result: {result}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>You must be logged in as an admin to perform this test.</p>
        </div>
      )}
    </div>
  )
}