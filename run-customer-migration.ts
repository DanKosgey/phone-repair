#!/usr/bin/env node

/**
 * Script to run the customer migration function in the database
 * 
 * This script calls the database function we created to migrate
 * existing ticket customer data to the customers table.
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

async function runCustomerMigration() {
  console.log('Running customer migration function...')
  
  try {
    // Call the database function
    const { data, error } = await supabase
      .rpc('migrate_ticket_customers_to_customers')
    
    if (error) {
      throw new Error(`Error calling migration function: ${error.message}`)
    }
    
    console.log('Migration function completed successfully!')
    console.log('Results:', data)
    
    if (data && data.length > 0) {
      const result = data[0]
      console.log(`\nMigration Statistics:`)
      console.log(`Tickets migrated: ${result.migrated_count}`)
      console.log(`New customers created: ${result.created_count}`)
      console.log(`Existing customers linked: ${result.linked_count}`)
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runCustomerMigration()