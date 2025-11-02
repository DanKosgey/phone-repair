# Route Documentation

## App Router Routes (src/app)

### Public Routes
- `/` - Home page
- `/about` - About page
- `/contact` - Contact page
- `/login` - Login page
- `/products` - Products page
- `/marketplace` - Marketplace page
- `/track` - Track ticket page
- `/reset-password` - Reset password page
- `/update-password` - Update password page

### Admin Routes
- `/admin` - Admin dashboard (redirects to /admin/dashboard)
- `/admin/customers` - Customer management
- `/admin/orders` - Order management
- `/admin/products` - Product management
- `/admin/settings` - System settings
- `/admin/tickets` - Ticket management (main list)
- `/admin/tickets/[id]` - View individual ticket
- `/admin/tickets/[id]/edit` - Edit individual ticket
- `/admin/tickets/new` - Create new ticket

## Pages Router Routes (src/pages)

### Public Routes
- `/marketplace` - Marketplace page
- `/products` - Products page
- `/track` - Track ticket page

### Admin Routes
- `/admin/dashboard` - Admin dashboard
- `/admin/customers` - Customer management
- `/admin/orders` - Order management
- `/admin/products` - Product management
- `/admin/settings` - System settings
- `/admin/tickets` - Ticket management (main list)
- `/admin/tickets/[id]` - View individual ticket
- `/admin/tickets/[id]/edit` - Edit individual ticket
- `/admin/tickets/new` - Create new ticket

## Conflicting Routes

The following routes exist in both routing systems:
- `/admin/tickets` (App: src/app/admin/tickets/page.tsx, Pages: src/pages/admin/tickets.tsx)
- `/admin/tickets/[id]` (App: src/app/admin/tickets/[id]/page.tsx, Pages: src/pages/admin/tickets/[id].tsx)
- `/admin/tickets/[id]/edit` (App: src/app/admin/tickets/[id]/edit/page.tsx, Pages: src/pages/admin/tickets/[id]/edit.tsx)
- `/admin/tickets/new` (App: src/app/admin/tickets/new/page.tsx, Pages: src/pages/admin/tickets/new.tsx)

## Route Purposes

### Ticket Management Routes
- `/admin/tickets` - Displays a list of all repair tickets with search functionality
- `/admin/tickets/new` - Form for creating a new repair ticket
- `/admin/tickets/[id]` - Detailed view of a specific repair ticket
- `/admin/tickets/[id]/edit` - Form for editing an existing repair ticket

All ticket routes require admin authentication and will redirect to `/login` if the user is not authenticated or is not an admin.