# Ticket Photo Display Fix

This document describes the fix for the ticket photo display issue where photos were successfully uploaded but not visible in the ticket detail view.

## Issue

Ticket photos were being successfully uploaded to the `ticket-photos` storage bucket but were not displaying in the ticket detail view. The photos were stored correctly in the database and the URLs were being retrieved, but the images were not loading in the browser.

## Root Cause

The issue was caused by two configuration problems:

1. **Bucket Privacy Setting**: The `ticket-photos` bucket was set to private (`public = false`), which prevented public access to the uploaded photos.

2. **RLS Policies**: The row-level security policies only allowed authenticated users to view photos, but the photos were being accessed via public URLs.

## Solution

### 1. Updated Bucket Privacy

Changed the `ticket-photos` bucket from private to public in the migration file:
```sql
-- Before
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-photos', 'ticket-photos', false)

-- After
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-photos', 'ticket-photos', true)
```

### 2. Updated RLS Policies

Replaced the restrictive view policies with a public view policy similar to the products bucket:
```sql
-- Before (restrictive)
CREATE POLICY "Users can view own ticket photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all ticket photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-photos' AND
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- After (public access)
CREATE POLICY "Anyone can view ticket photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ticket-photos');
```

## Implementation Details

### Storage Bucket Configuration
- **Bucket Name**: `ticket-photos`
- **Public Access**: True (public storage)
- **Admin Access**: Full access for upload, update, delete operations
- **Public Access**: Anyone can view photos (for displaying in the UI)
- **Service Role**: Supported for backend operations

### File Access Pattern
1. Photos are uploaded by admins to the `ticket-photos` bucket
2. Public URLs are generated for the uploaded photos
3. These public URLs are stored in the `device_photos` column of the tickets table
4. When displaying ticket details, the public URLs are used directly in `<img>` tags

### Security Considerations
1. Admins still have full control over photo operations
2. Photos are publicly accessible but this is acceptable for a repair shop business
3. No sensitive information is stored in the photo filenames
4. Service role support is maintained for backend operations

## Testing

The fix was tested by:
1. Creating a new ticket with photo uploads
2. Verifying photos are successfully stored in the `ticket-photos` bucket
3. Confirming photos display correctly in the ticket detail view
4. Ensuring public URLs work for image display

## Related Files

1. `supabase/migrations/033_create_ticket_photos_bucket.sql` - Updated bucket privacy and RLS policies
2. `src/components/admin/tickets/[id]/index.tsx` - Ticket detail view with photo display
3. `src/components/admin/tickets/TicketForm.tsx` - Ticket creation form with photo upload
4. `src/lib/storageService.ts` - Storage service used for uploads

The ticket photo functionality now works correctly with photos displaying properly in the ticket detail view.