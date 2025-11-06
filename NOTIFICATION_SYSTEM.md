# Notification System Documentation

## Overview
The notification system allows customers to send messages through the contact form, which are then displayed as notifications in the admin dashboard.

## Components

### 1. Database Schema
- **Table**: `notifications`
- **Fields**:
  - `id` (UUID): Primary key
  - `sender_name` (TEXT): Customer's name
  - `sender_email` (TEXT): Customer's email
  - `sender_phone` (TEXT, optional): Customer's phone number
  - `subject` (TEXT): Message subject
  - `message` (TEXT): Message content
  - `is_read` (BOOLEAN): Whether the notification has been read
  - `is_archived` (BOOLEAN): Whether the notification has been archived
  - `created_at` (TIMESTAMPTZ): Timestamp when created
  - `updated_at` (TIMESTAMPTZ): Timestamp when last updated

### 2. Database Functions
Located in `src/lib/db/notifications.ts`:
- `getUnreadCount()`: Get count of unread notifications
- `getAll()`: Get all notifications
- `getById(id)`: Get specific notification by ID
- `create(notification)`: Create new notification
- `markAsRead(id)`: Mark notification as read
- `archive(id)`: Archive notification

### 3. Frontend Components

#### Customer Contact Page
- Located at `/contact`
- Form for customers to submit messages
- Submits to notifications database table

#### Admin Dashboard
- Displays notification count in header
- Shows recent unread notifications
- Links to full notification management page

#### Notification Management Page
- Located at `/admin/notifications`
- Lists all notifications with filtering options
- Allows marking as read and archiving

#### Notification Detail Page
- Located at `/admin/notifications/[id]`
- Shows full notification details
- Allows archiving and replying

## Real-time Updates
The admin dashboard uses Supabase real-time subscriptions to automatically update when new notifications are created or existing ones are updated.

## Testing
A test page is available at `/admin/test-notifications` to create test notifications and verify the system works correctly.

## RLS Policies
- Anyone can insert notifications (for contact form submissions)
- Only admins can view, update, or delete notifications