'use client'

import { useEffect, useState } from 'react'
import ProductForm from "@/components/admin/products/ProductForm"
import { productsDb } from "@/lib/db/products"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productsDb.getById(params.id)
        setProduct(data)
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
  }, [params.id, toast, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <ProductForm initialProduct={product} />
}