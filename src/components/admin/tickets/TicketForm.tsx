"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Save, ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { ticketsDb } from "@/lib/db/tickets"
import { storageService } from "@/lib/storageService"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from '@/server/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { logger } from '@/lib/utils/logger'
import { generateCSRFToken, storeCSRFToken, validateCSRFToken } from '@/lib/utils/csrf'
import { CameraCapture } from '@/components/ui/camera'
import { CustomerSearch } from './CustomerSearch'
import { CustomerModal } from './CustomerModal'
import { Customer } from '@/hooks/use-customers'

export default function TicketForm() {
  const { user, role, isLoading: authLoading } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deviceType, setDeviceType] = useState("")
  const [deviceBrand, setDeviceBrand] = useState("")
  const [deviceModel, setDeviceModel] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [estimatedCost, setEstimatedCost] = useState("")
  const [devicePhotos, setDevicePhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    setCsrfToken(token);
    
    return () => {
      // Clean up photo previews
      photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
    };
  }, []);

  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!authLoading) {
      if (!user || role !== 'admin') {
        router.push('/login')
      }
    }
  }, [user, role, authLoading, router])

  // Update customer fields when customer is selected
  useEffect(() => {
    if (customer) {
      setCustomerName(customer.name || "")
      setCustomerEmail(customer.email || "")
      setCustomerPhone(customer.phone || "")
    } else {
      setCustomerName("")
      setCustomerEmail("")
      setCustomerPhone("")
    }
  }, [customer])

  const handleCustomerSelect = (selectedCustomer: Customer) => {
    setCustomer(selectedCustomer)
  }

  const handleAddNewCustomer = () => {
    setIsCustomerModalOpen(true)
  }

  const handleCustomerCreated = (newCustomer: Customer) => {
    setCustomer(newCustomer)
    setIsCustomerModalOpen(false)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    processPhotoFiles(newFiles);
  }

  const handleCameraCapture = (file: File) => {
    processPhotoFiles([file]);
  }

  const processPhotoFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Invalid files",
        description: "Only image files are allowed",
        variant: "destructive",
      });
    }

    // Limit to 5 photos
    if (devicePhotos.length + validFiles.length > 5) {
      toast({
        title: "Too many photos",
        description: "You can only upload up to 5 photos",
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = validFiles.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Each photo must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setDevicePhotos(prev => [...prev, ...validFiles]);
    
    // Create previews
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  }

  const removePhoto = (index: number) => {
    setDevicePhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      return newPreviews.filter((_, i) => i !== index);
    });
  }

  const uploadPhotosToSupabase = async (files: File[]): Promise<string[]> => {
    try {
      const photoUrls: string[] = [];
      
      for (const file of files) {
        // Upload file to Supabase storage using our storage service
        // For ticket photos, we'll store images in the 'ticket-photos' bucket
        const publicUrl = await storageService.uploadFile(file, 'ticket-photos');
        console.log('Uploaded photo URL:', publicUrl); // Debug log
        photoUrls.push(publicUrl);
      }
      
      return photoUrls;
    } catch (error: any) {
      console.error('Error uploading photos:', error);
      throw error;
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

      // Enhanced customer validation with user-friendly error handling
      if (!customer) {
        toast({
          title: "Customer Required",
          description: "Please select an existing customer or create a new one before submitting the ticket.",
          variant: "destructive",
        });
        setIsLoading(false);
        return; // Exit early to prevent form submission
      }

      // Validate device information
      if (!deviceType || deviceType.trim().length < 2) {
        toast({
          title: "Invalid Device Type",
          description: "Device type must be at least 2 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!deviceBrand || deviceBrand.trim().length < 2) {
        toast({
          title: "Invalid Device Brand",
          description: "Device brand must be at least 2 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!deviceModel || deviceModel.trim().length < 1) {
        toast({
          title: "Device Model Required",
          description: "Device model is required.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!issueDescription || issueDescription.trim().length < 10) {
        toast({
          title: "Issue Description Too Short",
          description: "Issue description must be at least 10 characters long.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate estimated cost if provided
      if (estimatedCost && (isNaN(Number(estimatedCost)) || Number(estimatedCost) <= 0)) {
        toast({
          title: "Invalid Estimated Cost",
          description: "Estimated cost must be a positive number.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Upload photos if any
      let photoUrls: string[] = [];
      if (devicePhotos.length > 0) {
        photoUrls = await uploadPhotosToSupabase(devicePhotos);
      }

      // Generate ticket number
      const ticketNumber = `TKT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`

      // Create ticket using the ticketsDb function
      const ticketData = {
        user_id: user.id, // Use authenticated user's ID
        customer_id: customer.id, // Link to selected customer
        ticket_number: ticketNumber,
        customer_name: customer.name || customerName.trim(),
        customer_email: customer.email || customerEmail.trim(),
        customer_phone: customer.phone || customerPhone.trim(),
        device_type: deviceType.trim(),
        device_brand: deviceBrand.trim(),
        device_model: deviceModel.trim(),
        issue_description: issueDescription.trim(),
        estimated_cost: estimatedCost ? Number(estimatedCost) : null,
        device_photos: photoUrls.length > 0 ? photoUrls : null,
        status: 'received' as const,
        priority: 'normal' as const
      };

      const createdTicket = await ticketsDb.create(ticketData);

      toast({
        title: "Success",
        description: "Ticket created successfully",
      })
      
      // Redirect to the newly created ticket's view page
      if (createdTicket && createdTicket.id) {
        router.push(`/admin/tickets/${createdTicket.id}`)
      } else {
        // Fallback to tickets list if we don't have the ticket ID
        router.push("/admin/tickets")
      }
    } catch (error: any) {
      logger.error('TicketForm: Error creating ticket', error.message);
      // Provide user-friendly error messages
      let errorMessage = "Failed to create ticket. Please try again.";
      
      if (error.message) {
        // Don't expose sensitive technical details to the user
        if (error.message.includes('row-level security')) {
          errorMessage = "You don't have permission to create tickets. Please contact your administrator.";
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Your session has expired. Please sign in again.";
        } else if (error.message.includes('Network Error')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.length < 100) {
          // Only show short, user-friendly error messages
          errorMessage = error.message;
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
        <Link href="/admin/tickets">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Repair Ticket</h1>
          <p className="text-muted-foreground">
            Create a new repair ticket for a customer
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Hidden CSRF token field */}
        <input type="hidden" name="csrf_token" value={csrfToken || ''} />
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>
              Search for an existing customer or add a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CustomerSearch 
              onCustomerSelect={handleCustomerSelect}
              onAddNewCustomer={handleAddNewCustomer}
              initialCustomer={customer}
            />
            
            {!customer && (
              <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Customer Required:</span>
                  <span>Please select an existing customer or create a new one to enable the "Create Ticket" button.</span>
                </div>
              </div>
            )}
            
            {customer ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    readOnly
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
            <CardDescription>
              Enter details about the device that needs repair
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deviceType">Device Type</Label>
              <Input
                id="deviceType"
                placeholder="e.g., Smartphone, Tablet, Laptop"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceBrand">Device Brand</Label>
              <Input
                id="deviceBrand"
                placeholder="e.g., Apple, Samsung, Huawei"
                value={deviceBrand}
                onChange={(e) => setDeviceBrand(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceModel">Device Model</Label>
              <Input
                id="deviceModel"
                placeholder="e.g., iPhone 13 Pro, Samsung Galaxy S21"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedCost">Estimated Cost (KSh)</Label>
              <Input
                id="estimatedCost"
                type="number"
                placeholder="e.g., 5000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="issueDescription">Issue Description</Label>
              <Textarea
                id="issueDescription"
                placeholder="Describe the issue the device is experiencing..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Device Photos</CardTitle>
            <CardDescription>
              Upload photos of the device (up to 5 photos, max 5MB each)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-wrap gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="h-32 w-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 rounded-full"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {photoPreviews.length < 5 && (
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="border-2 border-dashed rounded-lg w-32 h-32 flex items-center justify-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Add Photo
                      </Button>
                      <div className="w-24">
                        <CameraCapture onCapture={handleCameraCapture} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardFooter className="flex justify-end gap-4">
            <Link href="/admin/tickets">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading || !customer}
              className={!customer ? "opacity-70 cursor-not-allowed" : ""}
              title={!customer ? "Please select a customer first" : isLoading ? "Creating ticket..." : "Create ticket"}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Creating..." : "Create Ticket"}
            </Button>
          </CardFooter>
        </Card>
        
        {isLoading && (
          <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md text-center">
            Creating ticket, please wait...
          </div>
        )}

        <CustomerModal 
          open={isCustomerModalOpen}
          onOpenChange={setIsCustomerModalOpen}
          onCustomerCreated={handleCustomerCreated}
        />
      </form>
      
    </div>
  )
}