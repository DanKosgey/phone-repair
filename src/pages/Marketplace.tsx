"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import Image from "next/image"
import { secondHandProductsDb } from "@/lib/db/secondhand_products"

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState('')
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch second-hand products from database
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const products = await secondHandProductsDb.getAll()
        setMarketplaceItems(products)
        setError(null)
      } catch (err) {
        console.error('Error fetching second-hand products:', err)
        setError('Failed to load marketplace items')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredItems = marketplaceItems.filter(item => 
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.condition?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get condition color
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Like New': return 'bg-blue-100 text-blue-800'
      case 'Good': return 'bg-green-100 text-green-800'
      case 'Fair': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error}</p>
          </div>
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
            Browse our selection of quality used electronics
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="flex flex-col">
              <CardHeader className="p-0">
                <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                  {item.image_url ? (
                    <Image 
                      src={item.image_url} 
                      alt={item.description || "Second-hand product"} 
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
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-lg line-clamp-1">{item.description || "No description"}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      Sold by {item.seller_name}
                    </CardDescription>
                  </div>
                  <Badge className={getConditionColor(item.condition)}>
                    {item.condition}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg text-primary">
                      KSh {item.price?.toLocaleString() || 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="w-full text-center text-sm text-muted-foreground">
                  Visit shop to purchase
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? 'No marketplace items found matching your search' : 'No marketplace items available'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}