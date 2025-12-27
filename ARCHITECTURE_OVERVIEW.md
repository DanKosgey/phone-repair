# RepairHub Architecture Overview

## 📐 Current Architecture (No Backend)

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                         │
│                     Next.js 15 App                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT COMPONENTS                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Admin   │  │  Shop    │  │  Track   │  │ AI Chat  │  │
│  │Dashboard │  │  Page    │  │  Page    │  │  Widget  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MOCK DATA LAYER                        │
│          src/lib/mock-data.ts (hardcoded)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Tickets  │  │ Products │  │  Users   │  │ 2nd Hand │  │
│  │  (6)     │  │  (6)     │  │  (1)     │  │ Items(4) │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ❌ NO PERSISTENCE
                    ❌ NO REAL-TIME UPDATES
                    ❌ NO USER AUTHENTICATION
                    ❌ DATA LOST ON REFRESH
```

---

## 🚀 Proposed Architecture (With Firebase Backend)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                              │
│                        Next.js 15 App                               │
│                     (Deployed on Firebase)                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLIENT COMPONENTS                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Admin   │  │  Shop    │  │  Track   │  │ AI Chat  │          │
│  │Dashboard │  │  Page    │  │  Page    │  │  Widget  │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
└───────┼─────────────┼─────────────┼─────────────┼──────────────────┘
        │             │             │             │
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │                            
                      ▼                            
┌─────────────────────────────────────────────────────────────────────┐
│                    API ROUTES LAYER                                 │
│                   (Next.js Route Handlers)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ /api/tickets │  │ /api/products│  │  /api/orders │            │
│  │              │  │              │  │              │            │
│  │ GET, POST    │  │ GET, POST    │  │ GET, POST    │            │
│  │ PATCH, DEL   │  │ PATCH, DEL   │  │ PATCH, DEL   │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴───────┐            │
│  │ /api/users   │  │ /api/auth    │  │ /api/chatbot │            │
│  │              │  │              │  │              │            │
│  │ GET, PATCH   │  │ login/signup │  │ POST (AI)    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   FIREBASE SERVICES                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     FIREBASE AUTH                            │  │
│  │  • User authentication (email/password, Google, etc.)       │  │
│  │  • Role-based access (admin, customer, technician)          │  │
│  │  • Session management                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      FIRESTORE DB                            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │  │
│  │  │  tickets/  │  │ products/  │  │  orders/   │            │  │
│  │  │            │  │            │  │            │            │  │
│  │  │ - RPR-001  │  │ - Phone    │  │ - ORD-001  │            │  │
│  │  │ - RPR-002  │  │   Cases    │  │ - ORD-002  │            │  │
│  │  │ - RPR-003  │  │ - Chargers │  │ - ORD-003  │            │  │
│  │  └────────────┘  └────────────┘  └────────────┘            │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │  │
│  │  │   users/   │  │second_hand/│  │chat_sessions│           │  │
│  │  │            │  │            │  │            │            │  │
│  │  │ - Admins   │  │ - Used     │  │ - Chat     │            │  │
│  │  │ - Customers│  │   Phones   │  │   History  │            │  │
│  │  └────────────┘  └────────────┘  └────────────┘            │  │
│  │  ✅ Real-time updates                                       │  │
│  │  ✅ Automatic indexing                                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  CLOUD STORAGE                               │  │
│  │  • Device photos (for tickets)                              │  │
│  │  • Product images                                            │  │
│  │  • User avatars                                              │  │
│  │  • Documents (repair reports, invoices)                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 CLOUD FUNCTIONS                              │  │
│  │  • Send email notifications (ticket updates)                │  │
│  │  • Send SMS alerts (repair ready)                           │  │
│  │  • Generate ticket numbers                                   │  │
│  │  • Process payments (M-Pesa integration)                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   GOOGLE GENKIT AI                                  │
│  • AI Chatbot (customer support)                                   │
│  • Powered by Gemini 2.5 Flash                                     │
│  • Tools: getTicketStatus, getProductInfo, bookAppointment         │
│  • Now connected to REAL Firebase data!                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Examples

### Example 1: Customer Tracks Repair Ticket

```
1. Customer visits /track page
2. Enters ticket number: RPR-2025-0001
                    │
                    ▼
3. Frontend calls: GET /api/tickets/track?number=RPR-2025-0001
                    │
                    ▼
4. API Route queries Firestore:
   db.collection('tickets')
     .where('ticketNumber', '==', 'RPR-2025-0001')
     .get()
                    │
                    ▼
5. Firestore returns ticket data:
   {
     status: "repairing",
     estimatedCompletion: "2025-10-18",
     ...
   }
                    │
                    ▼
6. API returns JSON to frontend
                    │
                    ▼
7. Frontend displays ticket status
   ✅ Real-time updates via Firestore listeners
```

### Example 2: Admin Creates New Ticket

```
1. Admin fills form in /admin/tickets
2. Clicks "Create Ticket"
                    │
                    ▼
3. Frontend calls: POST /api/tickets
   Body: {
     customerName: "John Doe",
     deviceBrand: "Apple",
     deviceModel: "iPhone 14",
     issueDescription: "Screen cracked",
     priority: "high"
   }
                    │
                    ▼
4. API Route:
   - Generates ticket number (RPR-2025-0123)
   - Adds to Firestore
   - Returns new ticket
                    │
                    ▼
5. Frontend updates UI immediately
6. All connected admins see update in real-time
   ✅ Firestore real-time sync
```

### Example 3: Customer Uses AI Chatbot

```
1. Customer clicks chat widget
2. Types: "What's the status of my repair RPR-2025-0001?"
                    │
                    ▼
3. Frontend calls: POST /api/chatbot
   Body: {
     message: "What's the status...",
     ticketNumber: "RPR-2025-0001"
   }
                    │
                    ▼
4. Genkit AI processes:
   - Detects ticket number
   - Calls tool: getRepairTicketStatus("RPR-2025-0001")
                    │
                    ▼
5. Tool queries Firestore:
   db.collection('tickets')
     .where('ticketNumber', '==', 'RPR-2025-0001')
     .get()
                    │
                    ▼
6. AI generates natural response:
   "Your iPhone 13 screen repair is currently being worked on. 
    It should be ready by October 18th."
                    │
                    ▼
7. Response shown in chat widget
   ✅ Powered by real data, not mock data!
```

### Example 4: Customer Shops for Accessories

```
1. Customer browses /shop
                    │
                    ▼
2. Frontend calls: GET /api/products?category=Phone Cases
                    │
                    ▼
3. Firestore returns products with real stock levels
                    │
                    ▼
4. Customer adds to cart
5. Clicks "Checkout"
                    │
                    ▼
6. POST /api/orders
   - Creates order in Firestore
   - Reduces product stock
   - Sends confirmation email (Cloud Function)
                    │
                    ▼
7. Order tracking page updates automatically
   ✅ Real-time order status updates
```

---

## 📊 Component Breakdown

### Frontend Components (Already Built)
```
✅ src/app/(main)/
   ├── page.tsx                 → Homepage
   ├── shop/page.tsx            → E-commerce shop
   ├── track/page.tsx           → Ticket tracking
   └── marketplace/page.tsx     → Second-hand items

✅ src/app/admin/
   ├── dashboard/page.tsx       → Admin overview
   ├── tickets/page.tsx         → Manage all tickets
   ├── products/page.tsx        → Inventory management
   ├── orders/page.tsx          → Order fulfillment
   ├── customers/page.tsx       → Customer database
   └── analytics/page.tsx       → Business metrics

✅ src/components/
   ├── chat-widget.tsx          → AI chatbot interface
   ├── header.tsx               → Navigation
   └── ui/*                     → 40+ UI components
```

### Backend to Build
```
❌ src/app/api/
   ├── tickets/
   │   ├── route.ts             → GET, POST all tickets
   │   └── [id]/route.ts        → GET, PATCH, DELETE single
   │
   ├── products/
   │   ├── route.ts             → GET, POST all products
   │   └── [id]/route.ts        → GET, PATCH, DELETE single
   │
   ├── orders/
   │   ├── route.ts             → GET, POST all orders
   │   └── [id]/route.ts        → GET, PATCH single
   │
   ├── users/
   │   ├── route.ts             → GET all users
   │   └── [id]/route.ts        → GET, PATCH single user
   │
   ├── auth/
   │   ├── login/route.ts       → User login
   │   ├── signup/route.ts      → User registration
   │   └── logout/route.ts      → User logout
   │
   └── chatbot/
       └── route.ts             → AI chatbot endpoint

❌ src/lib/
   ├── firebase-admin.ts        → Server-side Firebase SDK
   ├── firebase-client.ts       → Client-side Firebase SDK
   └── firebase-auth.ts         → Auth helpers

❌ src/hooks/
   ├── use-tickets.ts           → Ticket CRUD operations
   ├── use-products.ts          → Product CRUD operations
   ├── use-orders.ts            → Order operations
   └── use-auth.ts              → Authentication
```

---

## 🔐 Security Architecture

### Firebase Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own profile
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tickets
    match /tickets/{ticketId} {
      // Customers can read their own tickets
      allow read: if request.auth != null && 
                     (resource.data.customerId == request.auth.uid ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Only admins can create/update tickets
      allow create, update: if request.auth != null &&
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products - everyone can read, only admins can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null &&
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders - users can read their own
    match /orders/{orderId} {
      allow read: if request.auth != null &&
                     (resource.data.customerId == request.auth.uid ||
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 📈 Scalability

### Current (Mock Data)
```
Max Users:       ∞ (static site)
Max Tickets:     6 (hardcoded)
Max Products:    10 (hardcoded)
Data Growth:     0 (no persistence)
Concurrent Users: Limited by hosting
```

### With Firebase
```
Max Users:       Unlimited (Firebase Auth scales automatically)
Max Tickets:     Unlimited (Firestore scales to millions)
Max Products:    Unlimited
Data Growth:     Automatic scaling
Concurrent Users: Handles thousands simultaneously
Real-time:       ✅ All users see updates instantly
```

---

## 💾 Database Schema Comparison

### Current (TypeScript Objects)
```typescript
// Fixed in code, can't be modified at runtime
const mockTickets: RepairTicket[] = [
  { id: '1', ticketNumber: 'RPR-001', ... },
  { id: '2', ticketNumber: 'RPR-002', ... },
  // Only 6 tickets, hardcoded
];
```

### With Firebase (Dynamic)
```
tickets/                          ← Collection
  ├── Abc123xyz/                  ← Document ID (auto-generated)
  │   ├── ticketNumber: "RPR-2025-0001"
  │   ├── customerId: "user_456"
  │   ├── status: "repairing"
  │   ├── createdAt: 2025-10-16T10:30:00Z
  │   └── ... (all fields)
  │
  ├── Def456uvw/                  ← Another ticket
  │   └── ... (all fields)
  │
  └── ... (unlimited tickets)

✅ Add/edit/delete tickets dynamically
✅ Query by any field (status, customer, date, etc.)
✅ Real-time listeners for updates
✅ Automatic indexing for fast queries
```

---

## 🎯 Benefits of Proposed Architecture

| Feature | Before (Mock) | After (Firebase) |
|---------|---------------|------------------|
| **Data Persistence** | ❌ Lost on refresh | ✅ Permanent storage |
| **Real-time Updates** | ❌ None | ✅ Instant sync |
| **User Auth** | ❌ None | ✅ Secure login |
| **File Uploads** | ❌ Not possible | ✅ Cloud storage |
| **Scalability** | ❌ 6 tickets max | ✅ Millions of records |
| **Multiple Users** | ❌ No user system | ✅ Unlimited users |
| **Search/Filter** | ❌ Basic array filter | ✅ Complex queries |
| **Security** | ❌ No protection | ✅ Firestore rules |
| **Mobile App** | ❌ Hard to add | ✅ Easy with Firebase |
| **Backup** | ❌ No backup | ✅ Automatic backups |
| **Analytics** | ❌ Static numbers | ✅ Real metrics |
| **AI Chatbot** | ❌ Fake data | ✅ Real ticket lookup |

---

## 🚦 Migration Path

### Phase 1: Set Up Firebase
```
Week 1, Days 1-2
├── Create Firebase project
├── Enable Firestore, Auth, Storage
├── Add Firebase SDK to Next.js
└── Configure environment variables
```

### Phase 2: Backend APIs
```
Week 1, Days 3-5
├── Create /api/tickets routes
├── Create /api/products routes
├── Test with Postman/Thunder Client
└── Seed database with mock data
```

### Phase 3: Frontend Integration
```
Week 1, Days 6-7
├── Update admin dashboard to use APIs
├── Replace mock data imports
├── Test all CRUD operations
└── Verify real-time updates
```

### Phase 4: Authentication
```
Week 2
├── Add Firebase Auth
├── Create login/signup pages
├── Implement role-based access
└── Protect admin routes
```

### Phase 5: Production Ready
```
Week 3-4
├── Add file uploads
├── Email/SMS notifications
├── Payment integration
├── Analytics dashboard
└── Launch! 🚀
```

---

## 📋 Checklist to Get Started

- [ ] Review `BACKEND_IMPLEMENTATION_GUIDE.md` for detailed instructions
- [ ] Choose backend option (Firebase recommended)
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Install Firebase dependencies (`npm install firebase-admin`)
- [ ] Set up environment variables
- [ ] Create first API route (`/api/tickets`)
- [ ] Test API with sample data
- [ ] Update one admin page to use API
- [ ] Verify it works!
- [ ] Proceed with full implementation

---

**Next Step:** Choose your backend option and start with the implementation guide!
