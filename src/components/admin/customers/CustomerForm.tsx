"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Save, ArrowLeft, Search as SearchIcon } from "lucide-react"
import Link from "next/link"
import { customersDb } from "@/lib/db/customers"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/auth-context'
import { generateCSRFToken, storeCSRFToken, validateCSRFToken } from '@/lib/utils/csrf'
import { useCustomerSearch } from '@/hooks/use-customers'
import { debounce } from '@/lib/utils/debounce'

export default function CustomerForm({ initialCustomer = null }: { initialCustomer?: any }) {
  const { user, isLoading: authLoading } = useAuth()
  const [name, setName] = useState(initialCustomer?.name || "")
  const [email, setEmail] = useState(initialCustomer?.email || "")
  const [phone, setPhone] = useState(initialCustomer?.phone || "")
  const [isLoading, setIsLoading] = useState(false)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Generate CSRF token on component mount
  useEffect(() => {
    const token = generateCSRFToken();
    storeCSRFToken(token);
    setCsrfToken(token);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login')
      }
    }
  }, [user, authLoading, router])

  // Debounced search function
  const debouncedSearch = debounce(async (term: string) => {
    if (term.length >= 2) {
      setIsSearching(true)
      try {
        // Search for both active and deleted customers
        const results = await customersDb.search(term, true)
        setSearchResults(results || [])
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    } else {
      setSearchResults([])
    }
  }, 300)

  // Handle search input changes
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm])

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
        throw new Error('Customer name must be at least 2 characters long');
      }

      // Validate email if provided
      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address');
        }
      }

      // Validate phone if provided
      if (phone && phone.trim() !== '') {
        // Allow common phone number formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
        const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
        if (!phoneRegex.test(phone)) {
          throw new Error('Please enter a valid phone number (e.g., (555) 123-4567 or 555-123-4567)');
        }
      }

      // Prepare customer data (without notes field since it doesn't exist in the schema)
      const customerData = {
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null
      }

      let result
      if (initialCustomer) {
        // Update existing customer (not implemented in this version)
        toast({
          title: "Error",
          description: "Customer update is not implemented yet",
          variant: "destructive",
        })
        return
      } else {
        // Create new customer
        result = await customersDb.create(customerData)
        
        // Check if this was a restored customer (has an updated_at close to now)
        const isRestored = result.updated_at && 
          new Date(result.updated_at).getTime() > new Date().getTime() - 5000; // within 5 seconds
          
        toast({
          title: "Success",
          description: isRestored 
            ? "Customer record restored successfully" 
            : "Customer created successfully",
        })
      }

      // Redirect to customers list (or back to dashboard for now)
      router.push("/admin")
    } catch (error: any) {
      console.error('Error saving customer:', error)
      let errorMessage = "Failed to save customer. Please try again."
      
      // Check for duplicate customer error
      if (error.code === '23505') {
        // This is a duplicate key error
        if (error.message.includes('customers_email_key')) {
          errorMessage = `A customer with this email address already exists. Please check if this customer is already in the system or use a different email.`;
        } else if (error.message.includes('customers_phone_key')) {
          errorMessage = `A customer with this phone number already exists. Please check if this customer is already in the system or use a different phone number.`;
        } else {
          errorMessage = `A customer with similar details already exists. Please check if this customer is already in the system.`;
        }
      } else if (error.message) {
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
        <Link href="/admin">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{initialCustomer ? 'Edit Customer' : 'Add New Customer'}</h1>
          <p className="text-muted-foreground">
            {initialCustomer ? 'Update customer details' : 'Create a new customer profile'}
          </p>
        </div>
      </div>

      {/* Search for existing customers */}
      <Card>
        <CardHeader>
          <CardTitle>Check for Existing Customer</CardTitle>
          <CardDescription>
            Search by name, email, or phone number to see if customer already exists
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="border rounded-md max-h-60 overflow-y-auto">
              <div className="p-2 bg-muted text-sm font-medium">
                Found {searchResults.length} existing customer(s):
              </div>
              <div className="divide-y">
                {searchResults.map((customer) => (
                  <div key={customer.id} className="p-3 hover:bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{customer.name}</div>
                      {customer.deleted_at && (
                        <Badge variant="destructive" className="text-xs">
                          Deleted
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.email && <span>Email: {customer.email}</span>}
                      {customer.email && customer.phone && <span> • </span>}
                      {customer.phone && <span>Phone: {customer.phone}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Created: {new Date(customer.created_at).toLocaleDateString()}
                      {customer.deleted_at && ` • Deleted: ${new Date(customer.deleted_at).toLocaleDateString()}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {searchTerm.length > 0 && searchResults.length === 0 && !isSearching && (
            <div className="text-sm text-muted-foreground">
              No existing customers found. You can create a new customer below.
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        {/* Hidden CSRF token field */}
        <input type="hidden" name="csrf_token" value={csrfToken || ''} />
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>
              Enter the basic details for this customer
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardFooter className="flex justify-end gap-4">
            <Link href="/admin">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Link href="/admin/customers">
              <Button variant="outline">View All Customers</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : (initialCustomer ? "Update Customer" : "Create Customer")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

