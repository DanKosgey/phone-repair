# Customer Management System Design for Repair Tickets

## Current Issues

1. **Data Duplication**: Customer information is stored directly in each ticket
2. **No Customer History**: Cannot easily view all tickets for a specific customer
3. **Inconsistent Data**: Customer information may vary between tickets
4. **Difficult Search**: No efficient way to find previous customers

## Proposed Solution

Create a proper foreign key relationship between tickets and customers to enable:
1. Customer history tracking
2. Easy customer search
3. Consistent customer data
4. Better analytics

## Database Schema Changes

### 1. Add customer_id column to tickets table

```sql
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON public.tickets(customer_id);
```

### 2. Update existing tickets to link to customers

For existing tickets with customer information, we need to:
1. Check if a customer already exists with the same email/phone
2. If not, create a new customer record
3. Link the ticket to the customer

## Application Changes

### 1. Ticket Creation Form

Modify the ticket creation form to:
- Search for existing customers by name, email, or phone
- Select an existing customer or create a new one
- Automatically populate customer fields when a customer is selected

### 2. Customer Search

Implement a search functionality that allows admins to:
- Search customers by name, email, or phone
- View customer history (all tickets for that customer)
- Quickly create tickets for returning customers

### 3. Customer Management Dashboard

Create a dashboard to:
- View all customers
- See customer statistics (total tickets, total spent, etc.)
- Manage customer information

## Implementation Plan

1. Create database migration to add customer_id to tickets
2. Update ticket creation form
3. Implement customer search functionality
4. Create customer management dashboard
5. Add customer history view
6. Migrate existing data
7. Update admin dashboard metrics
8. Test workflow

## Benefits

1. **Better Customer Experience**: Quickly find previous customers
2. **Data Consistency**: Single source of truth for customer information
3. **Analytics**: Better reporting on customer behavior
4. **Efficiency**: Faster ticket creation for returning customers