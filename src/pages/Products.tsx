"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { productsDb } from "@/lib/db/products"
import { Database } from "../../types/database.types"
import { Search, ShoppingCart, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { useCartStore } from "@/stores/cart-store"
import { getFeatureSettings } from "@/lib/feature-toggle"
import { redirect } from "next/navigation"

type Product = Database['public']['Tables']['products']['Row']

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [featureEnabled, setFeatureEnabled] = useState(true)
  const { toast } = useToast()
  const { addItem } = useCartStore()

  useEffect(() => {
    // Check if the shop feature is enabled
    const checkFeatureEnabled = async () => {
      try {
        const settings = await getFeatureSettings()
        setFeatureEnabled(settings.enableShop)
        
        // If feature is disabled, redirect to home
        if (!settings.enableShop) {
          redirect('/')
          return
        }
        
        fetchProducts()
      } catch (error) {
        console.error('Error checking feature settings:', error)
        // Default to enabled if there's an error
        setFeatureEnabled(true)
        fetchProducts()
      }
    }

    checkFeatureEnabled()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productsDb.getAll()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price || 0,
      image: product.image_url
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  }

  // If feature is disabled, show a message
  if (!featureEnabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Feature Not Available</h1>
          <p className="text-muted-foreground mb-6">
            The product shop feature is currently disabled. Please check back later.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Our Products</h1>
          <p className="text-muted-foreground mb-6">
            Browse our collection of high-quality phone accessories and parts
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                    {product.image_url && product.image_url.startsWith('http') ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.name} 
                        width={300}
                        height={300}
                        className="h-full w-full object-cover rounded-t-lg"
                        unoptimized
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                  <CardTitle className="text-lg mb-1">{product.name}</CardTitle>
                  <CardDescription className="mb-3 line-clamp-2">
                    {product.description}
                  </CardDescription>
                  <div className="font-bold text-lg text-primary">
                    KSh {product.price?.toLocaleString()}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}