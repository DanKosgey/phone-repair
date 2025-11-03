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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  BarChart, 
  BarChartHorizontal, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  ArrowUpDown,
  Image,
  Tag,
  ShoppingCart,
  DollarSign
} from "lucide-react"
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
  const [conditionFilter, setConditionFilter] = useState<string>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all')
  const [sortConfig, setSortConfig] = useState<{key: string, direction: string} | null>(null)
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
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply condition filter
    if (conditionFilter !== 'all') {
      result = result.filter(product => product.condition === conditionFilter)
    }
    
    // Apply availability filter
    if (availabilityFilter !== 'all') {
      result = result.filter(product => 
        availabilityFilter === 'available' ? product.is_available : !product.is_available
      )
    }
    
    // Apply sorting
    if (sortConfig !== null) {
      result.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    
    setFilteredProducts(result)
  }, [searchTerm, conditionFilter, availabilityFilter, products, sortConfig])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const data = await secondHandProductsDb.getAllAdmin()
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
      case 'Like New': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'Good': return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'Fair': return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const requestSort = (key: string) => {
    let direction = 'ascending'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (columnName: string) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'KSh 0'
    return `KSh ${amount.toLocaleString()}`
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

  // Calculate summary statistics
  const totalProducts = products.length
  const availableProducts = products.filter(p => p.is_available).length
  const soldProducts = totalProducts - availableProducts
  const avgPrice = products.length > 0 
    ? products.reduce((sum, product) => sum + (product.price || 0), 0) / products.length 
    : 0

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              All listings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products for sale
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldProducts}</div>
            <p className="text-xs text-muted-foreground">
              Completed sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(avgPrice)}</div>
            <p className="text-xs text-muted-foreground">
              Average listing price
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
        
        <div className="flex gap-2">
          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="Like New">Like New</SelectItem>
              <SelectItem value="Good">Good</SelectItem>
              <SelectItem value="Fair">Fair</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Table Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Image
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Product ID
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Seller
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Description
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Price
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Condition
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={true}
                onCheckedChange={() => {}}
              >
                Available
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('id')}>
                Product ID {getSortIcon('id')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('seller_name')}>
                Seller {getSortIcon('seller_name')}
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('price')}>
                Price {getSortIcon('price')}
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => requestSort('condition')}>
                Condition {getSortIcon('condition')}
              </TableHead>
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
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell>
                    {product.image_url ? (
                      <div className="relative h-16 w-16">
                        <img 
                          src={product.image_url} 
                          alt={product.description || "Product"} 
                          className="h-16 w-16 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center border">
                        <Image className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.id}</TableCell>
                  <TableCell>
                    {product.seller_name}
                    <div className="text-xs text-muted-foreground">
                      {product.seller_email}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={product.description || ""}>
                      {product.description}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${getConditionColor(product.condition)} cursor-pointer transition-colors`}
                      onClick={() => setConditionFilter(product.condition)}
                    >
                      {product.condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={product.is_available ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer' : 'bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer'}
                      onClick={() => setAvailabilityFilter(product.is_available ? 'available' : 'sold')}
                    >
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