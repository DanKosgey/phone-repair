# Ticket Photo Storage Fix

This document describes the fix for the ticket photo storage issue where admins were unable to upload photos due to row-level security policy violations.

## Issue

When admins tried to upload photos for tickets, they encountered the following error:
```
Failed to upload file: new row violates row-level security policy
```

This was caused by overly restrictive RLS policies on the `ticket-photos` storage bucket.

## Solution

### 1. Updated RLS Policies

The RLS policies for the `ticket-photos` bucket were updated to be more similar to the `products` bucket policies, allowing admins to:

- Upload photos
- Update photos
- Delete photos
- View all photos (in addition to users viewing their own)

### Key Changes in `supabase/migrations/033_create_ticket_photos_bucket.sql`:

1. **Upload Policy**: Changed from user-only to admin access with service role support
2. **Update Policy**: Changed from user-only to admin access with service role support
3. **Delete Policy**: Changed from user-only to admin access with service role support
4. **View Policy**: Kept user access to own photos, added admin access to all photos

### Before (Restrictive):
```sql
-- Upload: Only users could upload to their own folder
WITH CHECK (
  bucket_id = 'ticket-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)

-- Update/Delete: Only users could update/delete their own photos
USING (
  bucket_id = 'ticket-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
```

### After (Permissive for Admins):
```sql
-- Upload/Update/Delete: Admins can perform operations with service role support
WITH CHECK (
  bucket_id = 'ticket-photos' AND
  (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
    OR 
    -- Allow service role key access
    current_user = 'authenticator' AND current_setting('role') = 'service_role'
  )
)
```

## Implementation Details

### Storage Bucket Configuration
- **Bucket Name**: `ticket-photos`
- **Public Access**: False (private storage)
- **Admin Access**: Full access for upload, update, delete, and view operations
- **User Access**: Users can view their own photos
- **Service Role**: Supported for backend operations

### File Path Structure
Files are stored with the following path structure:
```
ticket-photos/{timestamp}-{random_string}.{extension}
```

### Security Considerations
1. Admins have full control over ticket photos
2. Regular users can only view their own photos
3. No public access to ticket photos
4. Service role support for backend operations
5. File type and size validation on the client side

## Testing

The fix was tested by:
1. Creating a new ticket with photo uploads
2. Verifying photos are successfully stored in the `ticket-photos` bucket
3. Confirming admins can view photos in ticket details
4. Ensuring RLS policies work as expected

## Related Files

1. `supabase/migrations/033_create_ticket_photos_bucket.sql` - Updated RLS policies
2. `src/components/admin/tickets/TicketForm.tsx` - Ticket creation form with photo upload
3. `src/components/admin/tickets/[id]/index.tsx` - Ticket detail view with photo display
4. `src/lib/storageService.ts` - Storage service used for uploads

The ticket photo functionality now works correctly with proper security policies in place.