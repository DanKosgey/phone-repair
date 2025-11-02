'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { secondHandProductsDb } from "@/lib/db/secondhand_products"
import { useRouter, useParams } from 'next/navigation'

export default function AdminViewSecondHandProductPage() {
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
          const data = await secondHandProductsDb.getById(id)
          setProduct(data)
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch second-hand product",
          variant: "destructive",
        })
        router.push('/admin/secondhand-products')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, toast, router])

  const handleDeleteProduct = async () => {
    try {
      if (id && typeof id === 'string') {
        await secondHandProductsDb.delete(id)
        toast({
          title: "Success",
          description: "Second-hand product deleted successfully",
        })
        router.push('/admin/secondhand-products')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete second-hand product",
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
  if (!id || typeof id !== 'string') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Invalid Product ID</h2>
        <p className="text-muted-foreground mb-4">No valid second-hand product ID was provided.</p>
        <Button onClick={() => router.push('/admin/secondhand-products')}>
          Back to Second-Hand Products
        </Button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-2">Second-Hand Product Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested second-hand product could not be found.</p>
        <Button onClick={() => router.push('/admin/secondhand-products')}>
          Back to Second-Hand Products
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/secondhand-products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Second-Hand Product Details</h1>
          <p className="text-muted-foreground">
            View second-hand product information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{product?.description}</CardTitle>
              <CardDescription>
                Managed by {product?.seller_name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/secondhand-products/${id}/edit`}>
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
                alt="Second-hand product" 
                className="w-full h-64 object-cover rounded-lg border mb-4"
              />
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="text-base">{product?.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Condition</h3>
              <p className="text-base">{product?.condition}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
              <p className="text-2xl font-bold">KSh {product?.price?.toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Available</h3>
              <p className="text-base">{product?.is_available ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Shop Information</h3>
              <p className="text-base">Managed by: {product?.seller_name}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Created: {product?.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'}
          </p>
          <p className="text-sm text-muted-foreground">
            Last Updated: {product?.updated_at ? new Date(product.updated_at).toLocaleDateString() : 'N/A'}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}