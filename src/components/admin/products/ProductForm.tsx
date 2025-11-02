"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, ArrowLeft, Upload } from "lucide-react"
import Link from "next/link"
import { productsDb } from "@/lib/db/products"
import { storageService } from "@/lib/storageService"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { generateCSRFToken, storeCSRFToken, validateCSRFToken } from '@/lib/utils/csrf'

export default function ProductForm({ initialProduct = null }: { initialProduct?: any }) {
  const { user, role, isLoading: authLoading, refreshSession } = useAuth()
  const [name, setName] = useState(initialProduct?.name || "")
  const [category, setCategory] = useState(initialProduct?.category || "")
  const [description, setDescription] = useState(initialProduct?.description || "")
  const [price, setPrice] = useState(initialProduct?.price || "")
  const [stockQuantity, setStockQuantity] = useState(initialProduct?.stock_quantity || "")
  const [isFeatured, setIsFeatured] = useState(initialProduct?.is_featured || false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialProduct?.image_url || null)
  const [isLoading, setIsLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    setCsrfToken(token);
  }, []);

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        router.push('/login')
      }
    }
  }, [user, role, authLoading, router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    try {
      // Upload file to Supabase storage using our storage service
      const publicUrl = await storageService.uploadFile(file, 'products')
      return publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate CSRF token
      if (!csrfToken || !validateCSRFToken(csrfToken)) {
        throw new Error('Invalid request. Please refresh the page and try again.');
      }

      // Validate form inputs
      if (!name || name.trim().length < 2) {
        throw new Error('Product name must be at least 2 characters long');
      }

      if (!category || category.trim().length < 2) {
        throw new Error('Category must be at least 2 characters long');
      }

      if (!description || description.trim().length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }

      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        throw new Error('Price must be a positive number');
      }

      if (stockQuantity && (isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0)) {
        throw new Error('Stock quantity must be a non-negative number');
      }

      // Upload image if provided
      let imageUrl = initialProduct?.image_url || ''
      if (imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile)
      } else if (!imageUrl) {
        throw new Error('Product image is required');
      }

      // Prepare product data
      const productData = {
        name: name.trim(),
        category: category.trim(),
        description: description.trim(),
        price: Number(price),
        stock_quantity: stockQuantity ? Number(stockQuantity) : null,
        image_url: imageUrl,
        is_featured: isFeatured,
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      }

      let result
      if (initialProduct) {
        // Update existing product
        result = await productsDb.update(initialProduct.id, productData)
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        // Create new product
        result = await productsDb.create(productData)
        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }

      // Redirect to products list
      router.push("/admin/products")
    } catch (error: any) {
      console.error('Error saving product:', error)
      let errorMessage = "Failed to save product. Please try again."
      
      if (error.message) {
        if (error.message.length < 100) {
          errorMessage = error.message
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
          <h1 className="text-3xl font-bold">{initialProduct ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-muted-foreground">
            {initialProduct ? 'Update product details' : 'Create a new product for your inventory'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Hidden CSRF token field */}
        <input type="hidden" name="csrf_token" value={csrfToken || ''} />
        
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Enter the basic details for this product
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (KSh)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isFeatured">Featured Product</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
            <CardDescription>
              Upload an image for this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {imagePreview ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Product preview" 
                      className="h-48 w-48 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      ×
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="border-2 border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardFooter className="flex justify-end gap-4">
            <Link href="/admin/products">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : (initialProduct ? "Update Product" : "Create Product")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}