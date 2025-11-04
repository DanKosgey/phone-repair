"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, User } from "lucide-react"
import { useCustomerSearch } from '@/hooks/use-customers'
import { Customer } from '@/hooks/use-customers'
import { useDebounce } from '@/hooks/use-debounce'

interface CustomerSearchProps {
  onCustomerSelect: (customer: Customer) => void
  onAddNewCustomer: () => void
  initialCustomer?: Customer | null
}

export function CustomerSearch({ onCustomerSelect, onAddNewCustomer, initialCustomer }: CustomerSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer || null)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  const { data: customers, isLoading } = useCustomerSearch(debouncedSearchTerm)
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    onCustomerSelect(customer)
    setIsOpen(false)
    setSearchTerm('')
  }
  
  // Clear selection
  const clearSelection = () => {
    setSelectedCustomer(null)
    setSearchTerm('')
    setIsOpen(false)
  }
  
  // Handle input focus
  const handleInputFocus = () => {
    if (searchTerm.length >= 2 || (customers && customers.length > 0)) {
      setIsOpen(true)
    }
  }
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
    
    // Clear selection if input is cleared
    if (value === '') {
      setSelectedCustomer(null)
    }
  }
  
  return (
    <div className="space-y-4" ref={searchContainerRef}>
      <div className="space-y-2">
        <Label htmlFor="customerSearch">Customer</Label>
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="customerSearch"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              className="pl-10 pr-20"
            />
            {selectedCustomer && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={clearSelection}
              >
                ×
              </Button>
            )}
          </div>
          
          {isOpen && (
            <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Searching...
                  </div>
                ) : customers && customers.length > 0 ? (
                  <div className="divide-y">
                    {customers.map((customer) => (
                      <Button
                        key={customer.id}
                        type="button"
                        variant="ghost"
                        className="w-full justify-start h-auto py-3 px-4 text-left"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 rounded-full p-2">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {customer.email} • {customer.phone}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : searchTerm.length >= 2 ? (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground mb-2">No customers found</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onAddNewCustomer}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Customer
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {selectedCustomer && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{selectedCustomer.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.email} • {selectedCustomer.phone}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}