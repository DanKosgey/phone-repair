'use client'

import { useEffect, useState } from 'react'
import ProductForm from "@/components/admin/products/ProductForm"
import { productsDb } from "@/lib/db/products"
import { useToast } from "@/hooks/use-toast"
import { useRouter, useParams } from 'next/navigation'

export default function AdminEditProductPage() {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Check if id is available and is a string
        if (id && typeof id === 'string') {
          const data = await productsDb.getById(id)
          setProduct(data)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch product",
          variant: "destructive",
        })
        router.push('/admin/products')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, toast, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If we don't have a valid id or product, show an error
  if (!id || typeof id !== 'string') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Invalid Product ID</h2>
        <p className="text-muted-foreground mb-4">No valid product ID was provided.</p>
        <button 
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Back to Products
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested product could not be found.</p>
        <button 
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Back to Products
        </button>
      </div>
    )
  }

  return <ProductForm initialProduct={product} />
}