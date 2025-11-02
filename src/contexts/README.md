# Authentication System

This directory contains the authentication system for the admin portal.

## Components

1. **Auth Context** (`auth-context.tsx`) - Main authentication context provider
2. **Protected Route** (`ProtectedRoute.tsx`) - Component to protect routes based on authentication status
3. **Admin Role Check** (`WithAdminRole.tsx`) - Component to conditionally render content for admin users
4. **Logout Button** (`LogoutButton.tsx`) - Reusable logout button component

## Pages

1. **Login** (`/login`) - Admin login page
2. **Password Reset** (`/reset-password`) - Password reset request page
3. **Update Password** (`/update-password`) - Password update page

## Utilities

1. **Session Management** (`../lib/auth/session.ts`) - Utility functions for session management
2. **Error Handling** (`../lib/auth/errors.ts`) - Authentication error handling
3. **Secure Storage** (`../lib/auth/storage.ts`) - Secure storage utilities

## Usage

### Protecting Routes

To protect a route, wrap it with the `ProtectedRoute` component:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Checking Admin Role

To conditionally render content for admin users:

```tsx
import { WithAdminRole } from '@/components/auth/WithAdminRole';

export default function Component() {
  return (
    <WithAdminRole>
      <div>Only visible to admin users</div>
    </WithAdminRole>
  );
}
```

### Using Auth Context

To access authentication state and functions:

```tsx
import { useAuth } from '@/contexts/auth-context';

export default function Component() {
  const { user, role, signIn, signOut } = useAuth();
  
  // Use auth functions and state
}
```

## Security Features

1. **Secure Token Storage** - Uses Supabase's built-in secure token storage
2. **Role-Based Access Control** - Enforces admin role for sensitive operations
3. **Session Management** - Automatic session refresh and validation
4. **Protected Routes** - Middleware protection for admin routes
5. **Error Handling** - Comprehensive error handling for auth failures