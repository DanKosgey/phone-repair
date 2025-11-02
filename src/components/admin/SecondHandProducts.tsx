"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { secondHandProductsDb } from "@/lib/db/secondhand_products"
import { Database } from "../../../types/database.types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'

type SecondHandProduct = Database['public']['Tables']['second_hand_products']['Row']

export default function AdminSecondHandProducts() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<SecondHandProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<SecondHandProduct[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        redirect('/login')
      }
    }
  }, [user, role, authLoading])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        description: error.message || "Failed to fetch second-hand products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Like New': return 'bg-blue-100 text-blue-800'
      case 'Good': return 'bg-green-100 text-green-800'
      case 'Fair': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await secondHandProductsDb.delete(productId)
      toast({
        title: "Success",
        description: "Second-hand product deleted successfully",
      })
      // Refresh the products list
      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete second-hand product",
        variant: "destructive",
      })
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Second-Hand Products</h1>
          <p className="text-muted-foreground">
            Manage all second-hand product listings
          </p>
        </div>
        <Link href="/admin/secondhand-products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Second-Hand Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search second-hand products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Available</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No second-hand products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt="Product" 
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">No Image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>
                    {product.seller_name}
                  </TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>KSh {product.price?.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getConditionColor(product.condition)}>
                      {product.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={product.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {product.is_available ? 'Available' : 'Sold'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/secondhand-products/${product.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/secondhand-products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}