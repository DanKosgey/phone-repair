'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { productsDb } from "@/lib/db/products"
import { useRouter, useParams } from 'next/navigation'

export default function AdminViewProductPage() {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [productId, setProductId] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()

  // Extract the id from params Promise
  useEffect(() => {
    const extractParams = async () => {
      if (params && typeof params === 'object' && 'id' in params) {
        if (params.id instanceof Promise) {
          const resolvedId = await params.id
          setProductId(resolvedId as string)
        } else {
          setProductId(params.id as string)
        }
      }
    }
    
    extractParams()
  }, [params])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Check if id is available and is a string
        if (productId) {
          const data = await productsDb.getById(productId)
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

    if (productId) {
      fetchProduct()
    }
  }, [productId, toast, router])

  const handleDeleteProduct = async () => {
    try {
      if (productId) {
        await productsDb.delete(productId)
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        router.push('/admin/products')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If we don't have a valid id or product, show an error
  if (!productId) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Invalid Product ID</h2>
        <p className="text-muted-foreground mb-4">No valid product ID was provided.</p>
        <Button onClick={() => router.push('/admin/products')}>
          Back to Products
        </Button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested product could not be found.</p>
        <Button onClick={() => router.push('/admin/products')}>
          Back to Products
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Product Details</h1>
          <p className="text-muted-foreground">
            View product information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{product?.name}</CardTitle>
              <CardDescription>
                {product?.category}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/products/${productId}/edit`}>
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={handleDeleteProduct}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {product?.image_url && (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-64 object-cover rounded-lg border"
              />
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="text-base">{product?.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
              <p className="text-2xl font-bold">KSh {product?.price?.toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Stock Quantity</h3>
              <p className="text-base">{product?.stock_quantity ?? 0}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Featured Product</h3>
              <p className="text-base">{product?.is_featured ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Created: {product?.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}