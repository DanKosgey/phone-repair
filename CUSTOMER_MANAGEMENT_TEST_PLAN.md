# Customer Management Test Plan

## Overview
This document outlines the testing procedures for the new customer management system for repair tickets. The system allows admins to create, search, and manage customers who bring in devices for repair.

## Test Environment
- Application: Jay's Phone Repair Admin Dashboard
- Database: Supabase with updated schema
- Browser: Latest versions of Chrome, Firefox, Safari

## Test Cases

### 1. Database Migration
**Objective**: Verify that existing ticket data is properly migrated to link with customers

**Pre-conditions**:
- Existing tickets with customer information but no customer_id
- Existing customers in the customers table

**Test Steps**:
1. Run the database migration script
2. Verify that tickets are linked to existing customers based on email/phone
3. Verify that new customers are created for tickets without matches
4. Verify that all tickets now have a customer_id

**Expected Results**:
- All tickets should have a customer_id
- Existing customers should be linked correctly
- New customers should be created as needed

### 2. Customer Search Functionality
**Objective**: Verify that admins can search for customers by name, email, or phone

**Pre-conditions**:
- Logged in as admin
- Customers exist in the database

**Test Steps**:
1. Navigate to the New Ticket page
2. Type in customer name in the search field
3. Verify that matching customers appear in the dropdown
4. Type in customer email in the search field
5. Verify that matching customers appear in the dropdown
6. Type in customer phone in the search field
7. Verify that matching customers appear in the dropdown
8. Click on a customer from the search results
9. Verify that customer details are populated in the form

**Expected Results**:
- Customers should be searchable by name, email, and phone
- Search results should appear in real-time
- Customer details should populate when selected

### 3. Creating New Customers
**Objective**: Verify that admins can create new customers during ticket creation

**Pre-conditions**:
- Logged in as admin
- On the New Ticket page

**Test Steps**:
1. Search for a customer that doesn't exist
2. Click "Add New Customer" button
3. Fill in customer details in the modal
4. Click "Create Customer"
5. Verify that the customer is selected in the form
6. Complete the ticket creation process
7. Navigate to the customer management page
8. Verify that the new customer appears in the list

**Expected Results**:
- New customers can be created through the modal
- Created customers are automatically selected
- New customers appear in the customer list

### 4. Ticket Creation with Customer Link
**Objective**: Verify that tickets are properly linked to customers

**Pre-conditions**:
- Logged in as admin
- Customer selected or created

**Test Steps**:
1. Select an existing customer or create a new one
2. Fill in device information
3. Submit the ticket
4. Navigate to the ticket details page
5. Verify that the customer is linked to the ticket
6. Navigate to the customer details page
7. Verify that the new ticket appears in the customer's history

**Expected Results**:
- Tickets should be linked to customers
- Customer history should show all related tickets
- Ticket details should show customer information

### 5. Customer Management Dashboard
**Objective**: Verify that the customer management dashboard works correctly

**Pre-conditions**:
- Logged in as admin
- Customers exist in the database

**Test Steps**:
1. Navigate to the Customers page
2. Search for customers using different criteria
3. Click on a customer to view details
4. Verify customer information is displayed
5. Verify customer ticket history is displayed
6. Click "View Ticket" for a ticket in the history
7. Verify navigation to the ticket details page

**Expected Results**:
- Customers should be searchable and viewable
- Customer details should be accurate
- Ticket history should be complete
- Navigation between customers and tickets should work

### 6. Customer History View
**Objective**: Verify that customer history shows all related tickets

**Pre-conditions**:
- Logged in as admin
- Customer with multiple tickets exists

**Test Steps**:
1. Navigate to a customer's detail page
2. Verify that all tickets for that customer are listed
3. Check that ticket details are accurate
4. Click on different tickets to verify navigation
5. Verify that ticket status and other information is correct

**Expected Results**:
- All tickets for a customer should be displayed
- Ticket information should be accurate
- Navigation to ticket details should work

### 7. Data Consistency
**Objective**: Verify that customer data is consistent across the application

**Pre-conditions**:
- Logged in as admin
- Customer exists with multiple tickets

**Test Steps**:
1. Check customer information on the ticket creation form
2. Check customer information on the ticket details page
3. Check customer information on the customer details page
4. Update customer information (if implemented)
5. Verify that changes are reflected in all locations

**Expected Results**:
- Customer information should be consistent across all views
- Updates should be reflected everywhere

## Edge Cases

### 1. Duplicate Customer Detection
**Test Steps**:
1. Try to create a customer with an email that already exists
2. Try to create a customer with a phone that already exists
3. Verify that the system handles duplicates appropriately

### 2. Special Characters in Customer Names
**Test Steps**:
1. Create customers with special characters in names
2. Search for these customers
3. Verify that search works correctly

### 3. Large Number of Search Results
**Test Steps**:
1. Search for a common name that returns many results
2. Verify that the UI handles large result sets appropriately
3. Verify that pagination or limiting works

## Performance Tests

### 1. Search Performance
**Test Steps**:
1. Measure search response time with small dataset
2. Measure search response time with large dataset
3. Verify that search remains responsive

### 2. Page Load Times
**Test Steps**:
1. Measure customer dashboard load time
2. Measure customer detail page load time
3. Measure ticket creation page load time

## Security Tests

### 1. Authorization
**Test Steps**:
1. Try to access customer pages as a non-admin user
2. Try to access customer pages without authentication
3. Verify that proper access controls are in place

### 2. Data Validation
**Test Steps**:
1. Try to submit invalid customer data
2. Try to submit invalid ticket data
3. Verify that proper validation is in place

## Post-Test Cleanup
- Remove test customers and tickets if needed
- Verify that production data is unaffected
- Document any issues found during testing

## Success Criteria
- All test cases pass
- No critical or high-severity bugs found
- Performance is acceptable
- Security measures are effective
- User experience is smooth and intuitive