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
import { 
  Card,
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  Filter,
  Grid,
  List,
  Download,
  Upload
} from "lucide-react"
import Link from "next/link"
import { productsDb } from "@/lib/db/products"
import { Database } from "../../../types/database.types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Product = Database['public']['Tables']['products']['Row']

export default function AdminProducts() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'created_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all')
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
    let result = [...products]
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(product => 
        product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply stock filter
    if (stockFilter !== 'all') {
      result = result.filter(product => {
        const stock = product.stock_quantity ?? 0
        switch (stockFilter) {
          case 'in_stock': return stock > 5
          case 'low_stock': return stock > 0 && stock <= 5
          case 'out_of_stock': return stock === 0
          default: return true
        }
      })
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: any, bValue: any
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
          break
        case 'price':
          aValue = a.price || 0
          bValue = b.price || 0
          break
        case 'stock':
          aValue = a.stock_quantity ?? 0
          bValue = b.stock_quantity ?? 0
          break
        case 'created_at':
          aValue = new Date(a.created_at).getTime()
          bValue = new Date(b.created_at).getTime()
          break
        default:
          aValue = a.name?.toLowerCase() || ''
          bValue = b.name?.toLowerCase() || ''
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredProducts(result)
  }, [searchTerm, stockFilter, sortBy, sortOrder, products])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productsDb.getAll()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (stockQuantity: number | null) => {
    if (stockQuantity === null || stockQuantity === 0) return 'bg-red-100 text-red-800'
    if (stockQuantity <= 5) return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (stockQuantity: number | null) => {
    if (stockQuantity === null || stockQuantity === 0) return 'Out of Stock'
    if (stockQuantity <= 5) return 'Low Stock'
    return 'In Stock'
  }

  const getStatusVariant = (stockQuantity: number | null) => {
    if (stockQuantity === null || stockQuantity === 0) return 'destructive'
    if (stockQuantity <= 5) return 'warning'
    return 'success'
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productsDb.delete(productId)
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      // Refresh the products list
      fetchProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const handleExportProducts = () => {
    toast({
      title: "Export Started",
      description: "Product data export has started. This may take a few moments.",
    })
  }

  const handleImportProducts = () => {
    toast({
      title: "Import Started",
      description: "Product data import has started. Please select a file to upload.",
    })
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Products
          </h1>
          <p className="text-muted-foreground">
            Manage all products in your inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImportProducts}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportProducts}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock Status</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setViewMode('table')}>
                <List className="h-4 w-4 mr-2" />
                Table View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setViewMode('grid')}>
                <Grid className="h-4 w-4 mr-2" />
                Grid View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* View Mode: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSortBy('name')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="p-0 h-auto font-semibold"
                  >
                    Product ID
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSortBy('name')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="p-0 h-auto font-semibold"
                  >
                    Name
                    {sortBy === 'name' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>Description</TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSortBy('price')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="p-0 h-auto font-semibold"
                  >
                    Price
                    {sortBy === 'price' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setSortBy('stock')
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                    className="p-0 h-auto font-semibold"
                  >
                    Stock
                    {sortBy === 'stock' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="hover:bg-accent/50 transition-colors"
                  >
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                    <TableCell className="font-medium">KSh {product.price?.toLocaleString()}</TableCell>
                    <TableCell>{product.stock_quantity ?? 0}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(product.stock_quantity)} variant="secondary">
                        {getStatusText(product.stock_quantity)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/products/${product.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/products/${product.id}/edit`}>
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
      ) : (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-all duration-300">
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{product.id}</p>
                    </div>
                    <Badge className={getStatusColor(product.stock_quantity)} variant="secondary">
                      {product.stock_quantity ?? 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">KSh {product.price?.toLocaleString()}</span>
                    <Badge className={getStatusColor(product.stock_quantity)} variant="secondary">
                      {getStatusText(product.stock_quantity)}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                  <Link href={`/admin/products/${product.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/products/${product.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Package className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold">
                {products.filter(p => (p.stock_quantity ?? 0) > 5).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Package className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">
                {products.filter(p => (p.stock_quantity ?? 0) > 0 && (p.stock_quantity ?? 0) <= 5).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Package className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold">
                {products.filter(p => (p.stock_quantity ?? 0) === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}