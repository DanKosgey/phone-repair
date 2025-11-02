# Second-Hand Products Admin Module

This module provides an admin interface for managing second-hand product listings in the marketplace.

## Features

1. **List View**: Displays all second-hand products with search and filter capabilities
2. **Detail View**: Shows comprehensive information about a specific second-hand product
3. **Create Form**: Allows admins to add new second-hand product listings
4. **Edit Form**: Enables modification of existing second-hand product details
5. **Image Upload**: Supports uploading images for second-hand products
6. **Automatic Product Association**: Automatically creates or uses an existing "Second-hand Item" product for catalog association

## Database Integration

The second-hand products are stored in the `second_hand_products` table, which has a foreign key constraint requiring each second-hand product to be associated with a product in the main `products` table. 

To satisfy this requirement, the system automatically:
1. Searches for an existing "Second-hand Item" product in the catalog
2. Creates one if it doesn't exist (with a price of 1 to satisfy constraints)
3. Associates all second-hand listings with this product

This approach maintains database integrity while providing flexibility for second-hand product listings.

## Storage Integration

Second-hand product images are stored in a dedicated `secondhand` storage bucket with appropriate RLS policies:
- Admins can upload, update, and delete images
- Anyone can view images (public access)
- All operations are restricted to authenticated admins

## Components

- `SecondHandProductsPage` - Main listing page
- `SecondHandProductDetailPage` - Detail view page
- `SecondHandProductForm` - Create/edit form component
- `SecondHandProductActions` - Action buttons component
- `SecondHandProductsTable` - Data table component

## Database Services

- `secondHandProductsDb` - Service for second-hand product operations
- `productsDb` - Service for main product operations (used for association)

## Routes

- `/admin/secondhand-products` - List view
- `/admin/secondhand-products/create` - Create form
- `/admin/secondhand-products/[id]` - Detail view
- `/admin/secondhand-products/[id]/edit` - Edit form

## Implementation Notes

1. All forms include CSRF protection
2. Image uploads are handled through Supabase Storage
3. Proper error handling and user feedback
4. Responsive design using shadcn/ui components
5. Role-based access control (admin only)