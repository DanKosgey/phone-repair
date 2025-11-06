# Phone Repair Shop Management System

A comprehensive management system for phone repair shops with customer management, ticket tracking, inventory management, and admin dashboard.

## Features

- **Customer Management**: Track customer information and repair history
- **Ticket Tracking**: Manage repair tickets from creation to completion
- **Inventory Management**: Keep track of parts and products
- **Admin Dashboard**: Comprehensive admin interface for managing all aspects
- **Public Website**: Customer-facing pages for services and contact

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Apply database migrations:
```bash
npm run migrate:local
```

3. Access the application at `http://localhost:9003`

## Authentication System

The application implements a secure authentication system with the following features:

### Admin Authentication

- **Secure Login**: Dedicated admin login page with email/password authentication
- **Role-Based Access Control**: Only users with 'admin' role can access the admin dashboard
- **Session Management**: Automatic session handling with secure token storage
- **Password Reset**: Secure password reset functionality
- **Logout**: Proper session termination

### Implementation Details

- **Simplified One-Way Flow**: Authentication follows a clear one-way procedure - sign in → verify role → proceed to dashboard
- **Improved Session Persistence**: Fixed issues with authentication state persistence that caused reloading problems
- **Context Provider**: Centralized authentication state management with optimized role fetching
- **Protected Components**: Components that conditionally render based on authentication status
- **Secure Storage**: Proper handling of authentication tokens using Supabase's secure storage
- **Error Handling**: Comprehensive error handling for authentication failures

### Available Authentication Pages

1. **Login**: `/login` - Admin login page
2. **Password Reset**: `/reset-password` - Request password reset
3. **Update Password**: `/update-password` - Update password after reset
4. **Admin Test**: `/admin-test` - Test authentication flow
5. **Auth Status**: `/auth-status` - Check current authentication status

### Protected Routes

All routes under `/admin/*` are protected and require admin authentication.

### Authentication Flow

1. User navigates to `/login`
2. User enters credentials and submits
3. On successful authentication, user is redirected to `/admin`
4. Admin layout verifies user role and displays dashboard
5. User can sign out at any time, which redirects to login page

This one-way flow ensures consistent authentication behavior without unnecessary redirects or reloading issues.

### Authentication Persistence Fixes

We've implemented several fixes to resolve authentication state persistence issues:

1. **Simplified Role Fetching**: Removed complex retry logic that caused delays
2. **Improved Session Cleanup**: Ensured all auth data is properly cleared on sign out
3. **Disabled Auto-Refresh in Middleware**: Prevented session refresh loops that caused reloading
4. **Added Timeout Handling**: Prevented infinite loading states
5. **Streamlined Redirect Logic**: Simplified the authentication flow to prevent loops

## Project Structure

```
src/
├── ai/                 # AI chatbot functionality
│   ├── flows/          # AI flow definitions
│   └── genkit.ts       # Genkit configuration
├── app/                # Next.js app router pages
│   ├── (main)/         # Public customer pages
│   ├── admin/          # Admin dashboard pages
│   ├── api/            # API routes
│   └── product/[slug]/ # Dynamic product pages
├── components/         # Reusable UI components
├── contexts/           # React context providers (including auth)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and types
├── server/             # Server-side utilities
└── ...
```

## API Endpoints

### Customer APIs