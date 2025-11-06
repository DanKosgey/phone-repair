"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { secondHandProductsDb } from "@/lib/db/secondhand_products"
import { Search, ShoppingCart, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { redirect } from "next/navigation"
import { getFeatureSettings } from "@/lib/feature-toggle"

export default function Marketplace() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [featureEnabled, setFeatureEnabled] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Check if the second-hand products feature is enabled
    const checkFeatureEnabled = async () => {
      try {
        const settings = await getFeatureSettings()
        setFeatureEnabled(settings.enableSecondHandProducts)
        
        // If feature is disabled, redirect to home
        if (!settings.enableSecondHandProducts) {
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
        product.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      const data = await secondHandProductsDb.getAll()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch marketplace products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // If feature is disabled, show a message
  if (!featureEnabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Feature Not Available</h1>
          <p className="text-muted-foreground mb-6">
            The device marketplace feature is currently disabled. Please check back later.
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
          <h1 className="text-3xl font-bold mb-2">Device Marketplace</h1>
          <p className="text-muted-foreground mb-6">
            Browse our collection of quality refurbished devices
          </p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
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
            <p className="text-muted-foreground">No devices found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader className="p-0">
                  <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.description || "Second-hand product"} 
                        width={300}
                        height={300}
                        className="h-full w-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4">
                  <CardTitle className="text-lg mb-1 line-clamp-1">{product.description}</CardTitle>
                  <CardDescription className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.condition}
                    </span>
                  </CardDescription>
                  <CardDescription className="mb-3 line-clamp-2">
                    Sold by: {product.seller_name}
                  </CardDescription>
                  <div className="font-bold text-lg text-primary">
                    KSh {product.price?.toLocaleString()}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    View Details
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