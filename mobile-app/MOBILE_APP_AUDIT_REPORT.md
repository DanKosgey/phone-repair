# Mobile App Audit & Implementation Plan - Phase 1

**Date:** 2025-12-06
**Scope:** Comparative analysis of Web App (Next.js) vs Mobile App (Expo/React Native)

---

## 1. Web App Analysis (The "Gold Standard")

### Core Features & Workflows
The Web Application (`src/app`) offers a comprehensive suite for both public users and administrators.

#### Public / Customer Facing
1.  **Home Page (`ClientHomePage.tsx`)**:
    - Dynamic sections controlled by Feature Toggles (`useFeatureToggle`).
    - Components: Hero, Services, Why Choose Us, Featured Products, Second Hand Products, Track Ticket CTA.
    - **Integration**: `MobileBottomNav` for mobile web users.
2.  **Repair Tracking (`/track`)**:
    - **EnhancedTrackTicket.tsx**: Massive component (22KB) suggesting detailed timeline, status steps, animations, and potentially chat/support integration.
3.  **Marketplace & Shop (`/marketplace`, `/products`)**:
    - Full browsing capability.
    - Likely integration with Cart/Checkout (though Stripe was not found, manual order flow is probable).
4.  **Auth**:
    - Login, Register, Password Reset, Profile Update.

#### Admin Portal (`/admin`)
1.  **Dashboard (`Dashboard.tsx`)**:
    - Heavy logic (30KB).
    - Analytics charts, Recent Activity, status overviews.
2.  **Ticket Management (`/admin/tickets`)**:
    - Full CRUD.
    - Likely detailed editing, status updates, photo handling (`storageService.ts`).
3.  **Customer Management (`/admin/customers`)**:
    - List, Search, Edit Customers.
    - **Status**: Completely missing in Mobile.
4.  **Inventory Management**:
    - **Products** (`Products.tsx`): CRUD for new items.
    - **Second Hand** (`SecondHandProducts.tsx`): CRUD for trade-ins/marketplace.
    - **Status**: Mobile only has "View" mode.
5.  **Settings (`Settings.tsx`)**:
    - Configuration for shop, profile, or app settings.
    - **Status**: Missing in Mobile.
6.  **Analytics (`analytics/`)**:
    - Detailed reports. Mobile has basic version.

### Tech Stack & Architecture
- **Framework**: Next.js (App Router).
- **State/Query**: React Query (TanStack Query) implied by `query-client.ts`. This provides robust caching and optimistic updates.
- **Database**: Supabase (PostgreSQL).
- **Auth**: Supabase Auth + Middleware protection.
- **Storage**: Supabase Storage for images.

---

## 2. Mobile App Analysis (Current State)

### Core Features
1.  **General**:
    - Tech Stack: Expo (SDK 54), React Native, TypeScript.
    - Navigation: React Navigation (Stack + Tabs).
2.  **Public**:
    - **Home**: Native implementation with Reanimated animations. Matches Web visually.
    - **Tracking**: `TrackRepairScreen`. Functional but basic (7KB vs Web's 22KB).
    - **Shop/Marketplace**: Implemented as View-Only. Connects to correct tables.
3.  **Auth**:
    - Login implemented (`useAuth`).
    - **Gap**: No Password Reset or Profile Update screens.
4.  **Admin**:
    - **Dashboard**: `AdminDashboard`. Shows metrics and recent tickets. Visual parity good, data density lower.
    - **Tickets**: `TicketsScreen`, `CreateTicketScreen`, `TicketDetailScreen`. Strong implementation.
    - **Analytics**: `AnalyticsScreen`. Implemented with Charts.

### Missing / Partial Features (Gap Analysis)
| Feature | Web App | Mobile App | Status |
|---------|---------|------------|--------|
| **Customer Management** | Full CRUD list & details | **Missing** | 🔴 Critical |
| **Inventory CRUD** | Add/Edit/Delete Products | **View Only** | 🔴 Critical |
| **Marketplace CRUD** | Add/Edit/Delete Items | **View Only** | 🔴 Critical |
| **Settings** | App/Shop configuration | **Missing** | 🟠 High |
| **Notifications** | System in place | **Missing** | 🟠 High |
| **Password Reset** | /reset-password route | **Missing** | 🟡 Medium |
| **Rich Tracking** | Detailed timeline & animations | Basic Status Check | 🟡 Medium |
| **Feature Toggles** | Dynamic DB-driven toggles | Hardcoded | ⚪ Low |

---

## 3. Database Query & API Comparison

### Query Patterns
- **Web**: Uses `React Query` for data fetching, caching, and background updates. Likely uses sophisticated filters.
- **Mobile**: Uses `useEffect` + direct `supabase.from().select()`.
    - **Risk**: No caching. User navigating back/forth triggers refetch.
    - **Optimization**: Mobile should adopt `TanStack Query` (React Query) for parity with Web architecture.

### Tables Accessed
- **Common**: `tickets`, `products`, `second_hand_products`, `profiles`.
- **Web Only (Likely)**:
    - `notifications`? (Implied by admin folder).
    - `settings` / `feature_toggles`? (Implied by hooks).

---

## 4. Workflows & UX Differences

1.  **Navigation**:
    - **Web**: Sidebar + Navbar.
    - **Mobile**: Bottom Tabs + Stack.
    - **Verdict**: Mobile implementation is native-appropriate and cooler.
2.  **Data Entry**:
    - Web forms likely easier for bulk entry.
    - Mobile forms (`CreateTicket`) customized for touch.
3.  **Roles**:
    - Web: Middleware protection.
    - Mobile: `App.tsx` conditional rendering.
    - **Security**: As long as RLS (Row Level Security) is enforced on DB, Mobile is secure.

---

## 5. Answers to Specific Questions

- **Same Database Tables?**: Yes, predominantly. Admin capabilities (Customers/Settings) on Web likely access tables Mobile currently ignores.
- **Workflow Optimization?**: Mobile flow is already streamlined (e.g., Quick Actions on Dashboard).
- **Permissions?**: Mobile respects `isAdmin` flag for UI. RLS ensures API security.
- **Error Handling?**: Mobile uses `Alert.alert`. Web likely uses Toasts/Modals.
- **Loading States?**: Mobile uses `ActivityIndicator`. Web uses Skeletons. Mobile could assume Skeletons for "Cooler" look.

---

## Recommendations for Phase 2 (Roadmap)

1.  **Priority 1: Admin Management Parity**
    - Build `CustomersScreen` (List/Detail).
    - Build `ManageProductsScreen` (Add/Edit).
    - Build `ManageMarketplaceScreen` (Add/Edit).
2.  **Priority 2: Architecture Upgrade**
    - Install `TanStack Query`. Refactor `useEffect` fetches.
3.  **Priority 3: Feature Completeness**
    - Add `SettingsScreen`.
    - Enhance `TrackRepairScreen` to match "EnhancedTrackTicket".
4.  **Priority 4: Polish**
    - Add Notifications.
    - Add Password Reset flow.

**This concludes Phase 1.**
