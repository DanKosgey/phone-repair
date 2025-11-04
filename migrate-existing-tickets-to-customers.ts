#!/usr/bin/env node

/**
 * Data migration script to link existing tickets to customers
 * 
 * This script will:
 * 1. Find tickets that don't have a customer_id but have customer information
 * 2. Try to match them with existing customers based on email or phone
 * 3. Create new customers for tickets that don't match existing customers
 * 4. Link tickets to their respective customers
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateTicketsToCustomers() {
  console.log('Starting ticket to customer migration...')
  
  try {
    // Get tickets without customer_id but with customer information
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, customer_name, customer_email, customer_phone')
      .is('customer_id', null)
      .not('customer_name', 'is', null)
    
    if (ticketsError) {
      throw new Error(`Error fetching tickets: ${ticketsError.message}`)
    }
    
    console.log(`Found ${tickets.length} tickets to process`)
    
    let migratedCount = 0
    let createdCount = 0
    let linkedCount = 0
    
    for (const ticket of tickets) {
      try {
        let customerId: string | null = null
        
        // Try to find existing customer by email
        if (ticket.customer_email) {
          const { data: emailCustomer, error: emailError } = await supabase
            .from('customers')
            .select('id')
            .eq('email', ticket.customer_email)
            .single()
          
          if (emailCustomer && !emailError) {
            customerId = emailCustomer.id
            linkedCount++
            console.log(`Linked ticket ${ticket.id} to existing customer by email: ${ticket.customer_email}`)
          }
        }
        
        // If not found by email, try to find by phone
        if (!customerId && ticket.customer_phone) {
          const { data: phoneCustomer, error: phoneError } = await supabase
            .from('customers')
            .select('id')
            .eq('phone', ticket.customer_phone)
            .single()
          
          if (phoneCustomer && !phoneError) {
            customerId = phoneCustomer.id
            linkedCount++
            console.log(`Linked ticket ${ticket.id} to existing customer by phone: ${ticket.customer_phone}`)
          }
        }
        
        // If still not found, create new customer
        if (!customerId) {
          const { data: newCustomer, error: createError } = await supabase
            .from('customers')
            .insert({
              name: ticket.customer_name || 'Unknown Customer',
              email: ticket.customer_email,
              phone: ticket.customer_phone
            })
            .select()
            .single()
          
          if (createError) {
            console.error(`Error creating customer for ticket ${ticket.id}:`, createError.message)
            continue
          }
          
          customerId = newCustomer.id
          createdCount++
          console.log(`Created new customer ${customerId} for ticket ${ticket.id}`)
        }
        
        // Link ticket to customer
        const { error: linkError } = await supabase
          .from('tickets')
          .update({ customer_id: customerId })
          .eq('id', ticket.id)
        
        if (linkError) {
          console.error(`Error linking ticket ${ticket.id} to customer ${customerId}:`, linkError.message)
          continue
        }
        
        migratedCount++
        console.log(`Successfully linked ticket ${ticket.id} to customer ${customerId}`)
      } catch (error) {
        console.error(`Error processing ticket ${ticket.id}:`, error)
      }
    }
    
    console.log('\nMigration completed!')
    console.log(`Tickets processed: ${migratedCount}`)
    console.log(`New customers created: ${createdCount}`)
    console.log(`Existing customers linked: ${linkedCount}`)
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
migrateTicketsToCustomers()