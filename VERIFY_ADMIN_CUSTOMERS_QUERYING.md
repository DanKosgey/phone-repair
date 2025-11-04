# Admin Customers Page Querying Verification

## Current Implementation Status

The admin customers page is correctly implemented with the following features:

1. **Debounced Search**: Uses 300ms debounce to prevent excessive queries
2. **Case-Insensitive Search**: Uses `ilike` for name, email, and phone searches
3. **Performance Optimization**: Limits results to 20 customers
4. **Ticket Count Integration**: Shows ticket counts for each customer
5. **Proper RLS Policies**: Admins can view all customers
6. **Database Indexes**: Optimized indexes for search performance

## Components Verified

### 1. Customers Page (`/src/app/admin/customers/page.tsx`)
- Implements search with debouncing
- Shows loading states
- Displays customer results with details
- Shows ticket counts
- Provides navigation to customer details

### 2. Customer Search Hook (`/src/hooks/use-customers.ts`)
- Queries customers by name, email, or phone
- Uses case-insensitive search
- Limits results to 20 for performance
- Includes ticket counts via subquery
- Proper error handling

### 3. Database Schema
- Customers table with proper fields
- Indexes for name, email, and phone searches
- RLS policies for admin access
- Foreign key relationship with tickets

## Expected Behavior

### Search Functionality
1. Admins can search customers by name, email, or phone
2. Search is case-insensitive
3. Results show customer details and ticket counts
4. Loading state appears during search
5. Empty state shows when no customers match

### Customer Display
1. Customer name, email, and phone are displayed
2. Ticket count is shown for each customer
3. "View Details" button navigates to customer page
4. "Add Customer" button creates new customers

### Performance
1. Search is debounced to prevent excessive queries
2. Results limited to 20 customers
3. Proper database indexes for fast querying
4. Efficient ticket count aggregation

## Testing Steps

### 1. Page Load
- [ ] Navigate to `/admin/customers`
- [ ] Verify page loads without errors
- [ ] Verify "Search for customers to get started" message appears

### 2. Search Functionality
- [ ] Type search term (2+ characters)
- [ ] Verify loading state appears
- [ ] Verify results appear after debounce
- [ ] Verify customer details are correct
- [ ] Verify ticket counts are accurate

### 3. Search Scenarios
- [ ] Search by name (exact match)
- [ ] Search by name (partial match)
- [ ] Search by email
- [ ] Search by phone
- [ ] Search with mixed case
- [ ] Search with special characters

### 4. Edge Cases
- [ ] Search with 1 character (should not trigger)
- [ ] Search with no results
- [ ] Search with many results (should limit to 20)
- [ ] Clear search (should show initial state)

### 5. Navigation
- [ ] Click "View Details" for a customer
- [ ] Verify navigation to customer detail page
- [ ] Click "Add Customer" button
- [ ] Verify navigation to customer creation

## Common Issues to Check

### 1. Authentication
- [ ] Ensure admin user has `role = 'admin'` in profiles table
- [ ] Verify session is active
- [ ] Check for authentication errors in console

### 2. Database
- [ ] Verify customers table has data
- [ ] Check RLS policies are applied
- [ ] Verify indexes exist
- [ ] Check for database connection errors

### 3. Frontend
- [ ] Check browser console for JavaScript errors
- [ ] Check network tab for failed API requests
- [ ] Verify React Query is functioning
- [ ] Check for TypeScript compilation errors

### 4. Performance
- [ ] Monitor query execution time
- [ ] Check for excessive re-renders
- [ ] Verify debounce is working
- [ ] Check memory usage

## Debugging Steps

### 1. Check Browser Console
```
// Look for errors like:
- "Error searching customers"
- "Failed to fetch customer tickets"
- Authentication errors
- Network errors
```

### 2. Check Network Tab
```
// Look for failed requests to:
- /rest/v1/customers
- /rest/v1/tickets
```

### 3. Check Database Directly
```sql
-- Verify customers exist
SELECT COUNT(*) FROM customers;

-- Test search query directly
SELECT 
  id, name, email, phone
FROM customers 
WHERE name ILIKE '%test%' 
   OR email ILIKE '%test%' 
   OR phone ILIKE '%test%'
ORDER BY name
LIMIT 20;

-- Check RLS policies
SELECT * FROM pg_policy WHERE polname ILIKE '%customer%';
```

### 4. Check Supabase Logs
- Look for authentication failures
- Check for RLS policy violations
- Monitor query performance

## Troubleshooting Guide

### Issue: No customers appear in search
**Solutions:**
1. Verify customers exist in database
2. Check RLS policies for customers table
3. Verify admin user has correct role
4. Check search term length (minimum 2 characters)

### Issue: Ticket counts show 0
**Solutions:**
1. Verify tickets have correct customer_id
2. Check tickets table data
3. Verify foreign key relationship

### Issue: Search is slow
**Solutions:**
1. Verify indexes exist on search fields
2. Check query execution time
3. Limit result set size
4. Optimize database queries

### Issue: Page doesn't load
**Solutions:**
1. Check for JavaScript errors
2. Verify all dependencies are installed
3. Check authentication status
4. Verify database connection

## Verification Checklist

- [ ] Customers page loads correctly
- [ ] Search functionality works
- [ ] Results display properly
- [ ] Ticket counts are accurate
- [ ] Navigation works
- [ ] No errors in console
- [ ] No failed network requests
- [ ] Performance is acceptable
- [ ] RLS policies are working
- [ ] Database indexes are applied

This verification ensures that the admin customers page is correctly querying and displaying customer data.