'use client'

import { useEffect, useState } from 'react'
import { ticketsDb } from '@/lib/db/tickets'
import { productsDb } from '@/lib/db/products'
import { useToast } from '@/hooks/use-toast'

export default function DebugDbPage() {
  const [tickets, setTickets] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState({ tickets: true, products: true })
  const [error, setError] = useState<{ tickets: string | null; products: string | null }>({ tickets: null, products: null })
  const { toast } = useToast()

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        console.log('DebugDbPage: Fetching tickets...')
        const data = await ticketsDb.getAll()
        console.log('DebugDbPage: Tickets fetched:', data)
        setTickets(data)
        setError(prev => ({ ...prev, tickets: null }))
      } catch (err: any) {
        console.error('DebugDbPage: Error fetching tickets:', err)
        const errorMessage = err.message || 'Unknown error'
        setError(prev => ({ ...prev, tickets: errorMessage }))
        toast({
          title: "Error fetching tickets",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(prev => ({ ...prev, tickets: false }))
      }
    }

    const fetchProducts = async () => {
      try {
        console.log('DebugDbPage: Fetching products...')
        const data = await productsDb.getAll()
        console.log('DebugDbPage: Products fetched:', data)
        setProducts(data)
        setError(prev => ({ ...prev, products: null }))
      } catch (err: any) {
        console.error('DebugDbPage: Error fetching products:', err)
        const errorMessage = err.message || 'Unknown error'
        setError(prev => ({ ...prev, products: errorMessage }))
        toast({
          title: "Error fetching products",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(prev => ({ ...prev, products: false }))
      }
    }

    fetchTickets()
    fetchProducts()
  }, [toast])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tickets Section */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Tickets</h2>
          {error.tickets && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error.tickets}
            </div>
          )}
          {loading.tickets ? (
            <div>Loading tickets...</div>
          ) : (
            <div>
              <p>Count: {tickets.length}</p>
              {tickets.length > 0 ? (
                <ul className="mt-2 max-h-60 overflow-y-auto">
                  {tickets.slice(0, 10).map((ticket) => (
                    <li key={ticket.id} className="mb-1 p-2 border-b">
                      <div className="font-medium">{ticket.ticket_number}</div>
                      <div className="text-sm text-gray-600">{ticket.customer_name} - {ticket.device_brand} {ticket.device_model}</div>
                      <div className="text-xs text-gray-500">{new Date(ticket.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                  {tickets.length > 10 && (
                    <li className="text-sm text-gray-500">... and {tickets.length - 10} more</li>
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">No tickets found</p>
              )}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Products</h2>
          {error.products && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error.products}
            </div>
          )}
          {loading.products ? (
            <div>Loading products...</div>
          ) : (
            <div>
              <p>Count: {products.length}</p>
              {products.length > 0 ? (
                <ul className="mt-2 max-h-60 overflow-y-auto">
                  {products.slice(0, 10).map((product) => (
                    <li key={product.id} className="mb-1 p-2 border-b">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">Price: ${product.price}</div>
                      <div className="text-xs text-gray-500">Stock: {product.stock_quantity}</div>
                    </li>
                  ))}
                  {products.length > 10 && (
                    <li className="text-sm text-gray-500">... and {products.length - 10} more</li>
                  )}
                </ul>
              ) : (
                <p className="text-gray-500">No products found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Debug Dashboard Component */}
      <div className="mt-8 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Dashboard Component Test</h2>
        <p className="mb-4">This tests if the dashboard component can render properly:</p>
        <div className="border-2 border-dashed p-4">
          {/* We'll add the dashboard component test here */}
          <p>Dashboard component test will be added here</p>
        </div>
      </div>
    </div>
  )
}