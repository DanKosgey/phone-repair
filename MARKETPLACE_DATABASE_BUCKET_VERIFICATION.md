# Marketplace Database and Bucket Verification

This document verifies that the marketplace pages are correctly querying from the appropriate database tables and storage buckets.

## Admin Marketplace Page

### Database Queries
- **Table**: `second_hand_products`
- **Service**: `secondHandProductsDb` from `@/lib/db/secondhand_products`
- **Queries**:
  - `getAll()` - Fetches all available second-hand products
  - `getById(id)` - Fetches specific second-hand product by ID
  - `getByCondition(condition)` - Filters by product condition
  - `search(searchTerm)` - Searches by description or seller name
  - `getBySeller(sellerId)` - Filters by seller ID

### Storage Bucket
- **Bucket Name**: `secondhand`
- **Service**: `storageService` from `@/lib/storageService`
- **Usage**: Image uploads for second-hand product listings
- **RLS Policies**:
  - Admins can upload, update, and delete images
  - Anyone can view images (public access)

## Customer Marketplace Page

### Database Queries
- **Table**: `second_hand_products`
- **Service**: `secondHandProductsDb` from `@/lib/db/secondhand_products`
- **Query**: `getAll()` - Fetches all available second-hand products

### Storage Bucket
- **Bucket Name**: `secondhand`
- **Usage**: Displaying product images from `image_url` field
- **Access**: Public read access

## Verification Summary

✅ **Correct Database Table**: Both admin and customer marketplace pages query from the `second_hand_products` table
✅ **Correct Storage Bucket**: Both pages use the `secondhand` storage bucket
✅ **Proper Service Usage**: Both pages use the `secondHandProductsDb` service for database operations
✅ **Image Handling**: Images are uploaded to and retrieved from the correct bucket
✅ **Data Consistency**: Both pages work with the same data structure and fields

## Field Mapping

| Database Field | Usage |
|----------------|-------|
| `id` | Unique identifier for each product |
| `description` | Product description displayed to users |
| `condition` | Product condition (Like New, Good, Fair) |
| `price` | Product price in KSh |
| `is_available` | Availability status |
| `seller_name` | Name of the seller (Shop Owner for admin listings) |
| `seller_email` | Contact email for the seller |
| `image_url` | URL of the product image stored in the `secondhand` bucket |
| `product_id` | Foreign key to the main products table (for catalog association) |

## Recent Improvements

1. **Fixed Foreign Key Constraint**: Implemented automatic creation of "Second-hand Item" product with valid price (1) to satisfy constraints
2. **Dedicated Storage Bucket**: Created separate `secondhand` bucket instead of reusing `products` bucket
3. **Image URL Storage**: Added `image_url` column to store image locations
4. **Customer-Facing Integration**: Updated customer marketplace to query live data instead of mock data
5. **Proper Error Handling**: Added loading states and error messages for better UX

## Migration Files

1. `031_create_secondhand_bucket.sql` - Creates the dedicated storage bucket
2. `032_add_image_url_to_secondhand.sql` - Adds the image_url column to the table

All marketplace functionality now correctly uses the designated database table and storage bucket.