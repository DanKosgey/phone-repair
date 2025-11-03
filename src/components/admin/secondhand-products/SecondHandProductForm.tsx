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
import { secondHandProductsDb } from "@/lib/db/secondhand_products"
import { productsDb } from "@/lib/db/products"
import { storageService } from "@/lib/storageService"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/auth-context'
import { generateCSRFToken, storeCSRFToken, validateCSRFToken } from '@/lib/utils/csrf'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { CameraCapture } from '@/components/ui/camera'
import { getSupabaseBrowserClient } from '@/server/supabase/client'

export default function SecondHandProductForm({ initialProduct = null }: { initialProduct?: any }) {
  const { user, role, isLoading: authLoading } = useAuth()
  const [description, setDescription] = useState(initialProduct?.description || "")
  const [condition, setCondition] = useState(initialProduct?.condition || "Good")
  const [price, setPrice] = useState(initialProduct?.price || "")
  const [isAvailable, setIsAvailable] = useState(initialProduct?.is_available ?? true)
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
      processImageFile(file);
    }
  }

  const handleCameraCapture = (file: File) => {
    processImageFile(file);
  }

  const processImageFile = (file: File) => {
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
      // For second-hand products, we'll store images in the 'secondhand' bucket
      const publicUrl = await storageService.uploadFile(file, 'secondhand')
      return publicUrl
    } catch (error: any) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Don't submit if auth data is still loading
    if (authLoading) {
      toast({
        title: "Loading",
        description: "Please wait while we load your authentication data.",
      });
      return;
    }
    
    setIsLoading(true)

    try {
      // Validate CSRF token
      if (!csrfToken || !validateCSRFToken(csrfToken)) {
        throw new Error('Invalid request. Please refresh the page and try again.');
      }

      // Validate form inputs
      if (!description || description.trim().length < 5) {
        throw new Error('Description must be at least 5 characters long');
      }

      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        throw new Error('Price must be a positive number');
      }

      // Check if user data is available
      if (!user || !user.id || !user.email) {
        throw new Error('User authentication data is not available. Please refresh the page and try again.');
      }

      // Validate that we have a valid user ID
      if (!user.id || user.id === 'undefined') {
        throw new Error('Invalid user ID. Please refresh the page and try again.');
      }

      // Upload image if provided
      let imageUrl = initialProduct?.image_url || ''
      if (imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile)
      }

      // Find or create a generic "Second-hand Item" product to associate with this listing
      let secondHandProductRecord = null;
      try {
        // Search for existing "Second-hand Item" product by exact name
        const supabase = getSupabaseBrowserClient();
        const { data: existingProducts, error: searchError } = await supabase
          .from('products')
          .select('*')
          .eq('name', 'Second-hand Item')
          .limit(1);
        
        if (searchError) {
          throw new Error(`Failed to search for existing product: ${searchError.message}`);
        }
        
        if (existingProducts && existingProducts.length > 0) {
          // Use the existing product
          secondHandProductRecord = existingProducts[0];
        } else {
          // Create a generic "Second-hand Item" product if it doesn't exist
          secondHandProductRecord = await productsDb.create({
            name: "Second-hand Item",
            description: "Generic product for second-hand listings",
            price: 1, // Use 1 instead of 0 to satisfy the positive price constraint
            stock_quantity: 999, // Large stock quantity since this is a generic product
            image_url: imageUrl || "", // Use uploaded image if available
            is_featured: false,
            category: "Second-hand",
            slug: "second-hand-item" // Use fixed slug for the first (and only) generic product
          });
        }
      } catch (productError) {
        console.error('Error finding or creating second-hand product record:', productError);
        throw new Error('Failed to associate with product catalog. Please try again.');
      }

      // Prepare product data with valid product_id
      const productData = {
        description: description.trim(),
        condition,
        price: Number(price),
        is_available: isAvailable,
        seller_id: user.id, // Use admin user ID as seller_id since you're the escrow
        seller_name: "Shop Owner", // Default seller name since you're the escrow
        seller_email: user.email, // Use admin email
        product_id: secondHandProductRecord.id, // Use the valid product ID
        image_url: imageUrl || '' // Add image URL if available
      }

      let result
      if (initialProduct) {
        // Update existing second-hand product
        result = await secondHandProductsDb.update(initialProduct.id, productData)
        toast({
          title: "Success",
          description: "Second-hand product updated successfully",
        })
      } else {
        // Create new second-hand product
        result = await secondHandProductsDb.create(productData)
        toast({
          title: "Success",
          description: "Second-hand product created successfully",
        })
      }

      // Redirect to second-hand products list
      router.push("/admin/secondhand-products")
    } catch (error: any) {
      console.error('Error saving second-hand product:', error)
      let errorMessage = "Failed to save second-hand product. Please try again."
      
      if (error.message) {
        // Provide more specific guidance for the product_id constraint issue
        if (error.message.includes('foreign key constraint') || error.message.includes('product_id')) {
          errorMessage = "Database constraint error: The second_hand_products table requires a valid product_id that exists in the products table. Please ensure you have created a product to associate with second-hand items, or contact a developer to modify the database schema."
        } else if (error.message.length < 100) {
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
        <Link href="/admin/secondhand-products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{initialProduct ? 'Edit Second-Hand Product' : 'Add New Second-Hand Product'}</h1>
          <p className="text-muted-foreground">
            {initialProduct ? 'Update second-hand product details' : 'Create a new second-hand product listing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Show loading state while auth is loading */}
        {authLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {/* Hidden CSRF token field */}
        <input type="hidden" name="csrf_token" value={csrfToken || ''} />
        
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Enter the details for this second-hand product
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="condition">Condition</Label>
              <Select value={condition} onValueChange={setCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="isAvailable">Availability</Label>
              <Select value={isAvailable ? "available" : "sold"} onValueChange={(value) => setIsAvailable(value === "available")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Product Image</CardTitle>
            <CardDescription>
              Upload an image for this second-hand product (optional but recommended)
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
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <CameraCapture onCapture={handleCameraCapture} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="border-2 border-dashed rounded-lg w-48 h-48 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select Image
                    </Button>
                    <CameraCapture onCapture={handleCameraCapture} />
                  </div>
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
            <Link href="/admin/secondhand-products">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isLoading || authLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : (initialProduct ? "Update Product" : "Create Product")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}