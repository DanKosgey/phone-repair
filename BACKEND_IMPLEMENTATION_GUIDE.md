# Backend Implementation Guide for RepairHub

## Current State Analysis

### Application Overview
**RepairHub** is a Next.js 15 application for phone repair shop management with the following features:
- Repair ticket submission and tracking
- AI chatbot for customer support (using Google Genkit)
- Admin dashboard for ticket and order management
- E-commerce platform for accessories and second-hand products
- Customer management system
- Analytics dashboard

### Current Architecture
```
Frontend: Next.js 15 (App Router) + React + TypeScript
UI Library: shadcn/ui + Radix UI + Tailwind CSS
AI: Google Genkit with Gemini 2.5 Flash
Data: Mock data in TypeScript files
Hosting: Firebase App Hosting (apphosting.yaml configured)
```

### Data Currently Using Mock Data
The app currently uses hardcoded mock data defined in `src/lib/mock-data.ts`:

1. **RepairTicket** - Repair tickets with statuses, priorities, costs
2. **Product** - Shop products (accessories, chargers, cases, etc.)
3. **SecondHandProduct** - Used devices for sale
4. **User** - Admin user information

### Key Files Structure
```
src/
├── ai/
│   ├── genkit.ts                              # Genkit AI setup
│   └── flows/
│       └── ai-chatbot-customer-support.ts     # AI chatbot with tools
├── app/
│   ├── (main)/
│   │   ├── page.tsx                           # Home page
│   │   ├── shop/page.tsx                      # E-commerce shop
│   │   ├── track/page.tsx                     # Ticket tracking
│   │   └── marketplace/page.tsx               # Second-hand marketplace
│   └── admin/
│       ├── dashboard/page.tsx                 # Admin overview
│       ├── tickets/page.tsx                   # Ticket management
│       ├── products/page.tsx                  # Product management
│       ├── orders/page.tsx                    # Order management
│       ├── customers/page.tsx                 # Customer management
│       └── analytics/page.tsx                 # Analytics/reports
├── lib/
│   ├── mock-data.ts                           # All mock data
│   └── types.ts                               # TypeScript types
└── components/
    └── chat-widget.tsx                        # AI chatbot widget
```

---

## Backend Implementation Options

### Option 1: Firebase Backend (RECOMMENDED)

**Why this is the best choice:**
- Firebase already integrated (firebase dependency + apphosting.yaml)
- Fastest to implement
- Excellent for real-time updates (important for ticket tracking)
- Built-in authentication
- Scalable and serverless
- Free tier generous for startups

**Implementation Strategy:**

#### 1.1 Firebase Services to Use

```javascript
Firebase Auth      → User authentication & authorization
Firestore          → Main database (tickets, products, orders, customers)
Cloud Functions    → Server-side logic (ticket updates, notifications)
Cloud Storage      → Image uploads (device photos, product images)
Firebase Hosting   → Already configured via apphosting.yaml
```

#### 1.2 Database Structure (Firestore Collections)

```typescript
// Collections structure
firestore/
├── users/
│   └── {userId}
│       ├── name: string
│       ├── email: string
│       ├── role: 'admin' | 'customer'
│       ├── phone: string
│       └── createdAt: timestamp
├── tickets/
│   └── {ticketId}
│       ├── ticketNumber: string (indexed)
│       ├── customerId: string (ref to users)
│       ├── customerName: string
│       ├── deviceType: string
│       ├── deviceBrand: string
│       ├── deviceModel: string
│       ├── issueDescription: string
│       ├── status: string
│       ├── priority: string
│       ├── estimatedCost: number
│       ├── finalCost: number | null
│       ├── images: string[] (Storage URLs)
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── estimatedCompletion: timestamp | null
├── products/
│   └── {productId}
│       ├── name: string
│       ├── slug: string (indexed)
│       ├── category: string
│       ├── description: string
│       ├── price: number
│       ├── stockQuantity: number
│       ├── imageUrl: string
│       ├── isFeatured: boolean
│       └── condition?: string (for second-hand)
├── orders/
│   └── {orderId}
│       ├── customerId: string
│       ├── items: array
│       ├── totalAmount: number
│       ├── status: string
│       ├── paymentMethod: string
│       ├── shippingAddress: object
│       └── createdAt: timestamp
└── chat_sessions/
    └── {sessionId}
        ├── userId: string
        ├── messages: array
        └── createdAt: timestamp
```

#### 1.3 Implementation Steps

**Step 1: Set up Firebase Project**
```bash
npm install firebase-admin
# Initialize Firebase in your project
firebase init firestore
firebase init functions
firebase init storage
```

**Step 2: Create Firebase Service (src/lib/firebase-admin.ts)**
```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
```

**Step 3: Create API Routes (Next.js Route Handlers)**

Create `src/app/api/tickets/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import type { RepairTicket } from '@/lib/types';

// GET all tickets
export async function GET(request: NextRequest) {
  try {
    const ticketsRef = db.collection('tickets');
    const snapshot = await ticketsRef.orderBy('createdAt', 'desc').get();
    
    const tickets: RepairTicket[] = [];
    snapshot.forEach(doc => {
      tickets.push({ id: doc.id, ...doc.data() } as RepairTicket);
    });
    
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// POST new ticket
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Generate ticket number
    const ticketNumber = await generateTicketNumber();
    
    const newTicket = {
      ...data,
      ticketNumber,
      status: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await db.collection('tickets').add(newTicket);
    
    return NextResponse.json({ id: docRef.id, ...newTicket }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
```

Create `src/app/api/tickets/[id]/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

// GET single ticket
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doc = await db.collection('tickets').doc(params.id).get();
    
    if (!doc.exists) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

// PATCH update ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    
    await db.collection('tickets').doc(params.id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
  }
}

// DELETE ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.collection('tickets').doc(params.id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
```

**Step 4: Create Client-Side Data Fetching Hooks**

Create `src/hooks/use-tickets.ts`:
```typescript
import { useState, useEffect } from 'react';
import type { RepairTicket } from '@/lib/types';

export function useTickets() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      setTickets(data.tickets);
    } catch (err) {
      setError('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: Partial<RepairTicket>) => {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticketData),
    });
    const newTicket = await response.json();
    setTickets([newTicket, ...tickets]);
    return newTicket;
  };

  const updateTicket = async (id: string, updates: Partial<RepairTicket>) => {
    await fetch(`/api/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    setTickets(tickets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return { tickets, loading, error, createTicket, updateTicket, refetch: fetchTickets };
}
```

**Step 5: Update AI Chatbot to Use Real Data**

Modify `src/ai/flows/ai-chatbot-customer-support.ts`:
```typescript
import { db } from '@/lib/firebase-admin';

// Update the getRepairTicketStatus tool
const getRepairTicketStatus = ai.defineTool(
    {
        name: 'getRepairTicketStatus',
        description: 'Get the status of a repair ticket.',
        inputSchema: z.object({ ticketNumber: z.string() }),
        outputSchema: z.custom<RepairTicket>(),
    },
    async ({ ticketNumber }) => {
        // Query Firestore instead of mock data
        const snapshot = await db.collection('tickets')
            .where('ticketNumber', '==', ticketNumber.toUpperCase())
            .limit(1)
            .get();
        
        if (snapshot.empty) {
            throw new Error('Ticket not found');
        }
        
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as RepairTicket;
    }
);

// Similarly update other tools...
```

**Step 6: Add Real-time Updates (Optional but Recommended)**

Create `src/hooks/use-tickets-realtime.ts`:
```typescript
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client'; // Client-side Firebase

export function useTicketsRealtime() {
  const [tickets, setTickets] = useState<RepairTicket[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'tickets'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RepairTicket[];
      setTickets(ticketData);
    });

    return () => unsubscribe();
  }, []);

  return tickets;
}
```

#### 1.4 Pros & Cons

**Pros:**
✅ Already integrated in the project  
✅ Real-time updates out of the box  
✅ Excellent for mobile apps (future expansion)  
✅ Built-in authentication & security rules  
✅ Serverless - no infrastructure management  
✅ Good free tier (50K reads/day, 20K writes/day)  
✅ Built-in file storage  
✅ Works seamlessly with Google Genkit AI  

**Cons:**
❌ Not a relational database (but Firestore is document-based which fits this use case)  
❌ Complex queries can be limited  
❌ Can get expensive at high scale  

---

### Option 2: PostgreSQL + Prisma (If SQL Preferred)

**Best for:** Teams that prefer traditional SQL databases

#### 2.1 Setup

```bash
npm install prisma @prisma/client
npm install pg
npx prisma init
```

#### 2.2 Prisma Schema

Create `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role     @default(CUSTOMER)
  phone     String?
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  tickets   RepairTicket[]
  orders    Order[]
}

enum Role {
  CUSTOMER
  ADMIN
  TECHNICIAN
}

model RepairTicket {
  id                  String    @id @default(cuid())
  ticketNumber        String    @unique
  customerId          String
  customer            User      @relation(fields: [customerId], references: [id])
  customerName        String
  deviceType          String
  deviceBrand         String
  deviceModel         String
  issueDescription    String    @db.Text
  status              TicketStatus @default(RECEIVED)
  priority            Priority  @default(NORMAL)
  estimatedCost       Decimal?  @db.Decimal(10, 2)
  finalCost           Decimal?  @db.Decimal(10, 2)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  estimatedCompletion DateTime?
  
  @@index([ticketNumber])
  @@index([customerId])
  @@index([status])
}

enum TicketStatus {
  RECEIVED
  DIAGNOSING
  AWAITING_PARTS
  REPAIRING
  QUALITY_CHECK
  READY
  COMPLETED
  CANCELLED
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

model Product {
  id            String  @id @default(cuid())
  name          String
  slug          String  @unique
  category      String
  description   String  @db.Text
  price         Decimal @db.Decimal(10, 2)
  stockQuantity Int
  imageUrl      String
  imageHint     String?
  isFeatured    Boolean @default(false)
  
  // For second-hand products
  condition     String?
  sellerName    String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  orderItems    OrderItem[]
  
  @@index([slug])
  @@index([category])
}

model Order {
  id              String      @id @default(cuid())
  customerId      String
  customer        User        @relation(fields: [customerId], references: [id])
  status          OrderStatus @default(PENDING)
  totalAmount     Decimal     @db.Decimal(10, 2)
  paymentMethod   String?
  shippingAddress Json?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  items           OrderItem[]
  
  @@index([customerId])
  @@index([status])
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal @db.Decimal(10, 2)
  
  @@index([orderId])
}
```

#### 2.3 API Routes with Prisma

Create `src/app/api/tickets/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tickets = await prisma.repairTicket.findMany({
    orderBy: { createdAt: 'desc' },
    include: { customer: true }
  });
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const ticket = await prisma.repairTicket.create({
    data: {
      ...data,
      ticketNumber: await generateTicketNumber(),
    }
  });
  
  return NextResponse.json(ticket, { status: 201 });
}
```

#### 2.4 Hosting Options for PostgreSQL

1. **Supabase** (Recommended - includes Postgres + Auth + Storage)
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Neon** (Serverless Postgres)
   - Free tier: 10GB storage
   - Excellent for Next.js

3. **Railway** / **Render** (Managed Postgres)

4. **Vercel Postgres** (if deploying to Vercel)

#### 2.5 Pros & Cons

**Pros:**
✅ Full SQL capabilities & complex queries  
✅ ACID compliance & data integrity  
✅ Better for financial/transactional data  
✅ Familiar to most developers  
✅ Excellent tooling (Prisma Studio)  
✅ Blueprint mentions PostgreSQL schemas  

**Cons:**
❌ Requires database hosting  
❌ More setup complexity  
❌ Need to handle migrations  
❌ No built-in real-time (need to add)  
❌ Additional cost for hosting  

---

### Option 3: Next.js API Routes + Supabase (Best of Both Worlds)

**Why this is great:**
- PostgreSQL database (via Supabase)
- Built-in authentication
- Real-time subscriptions
- File storage
- Free tier generous
- Easy to set up

#### 3.1 Setup

```bash
npm install @supabase/supabase-js
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### 3.2 Client Setup

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// For admin operations (server-side only)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

#### 3.3 Database Schema (SQL)

Run in Supabase SQL Editor:
```sql
-- Users table (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'customer',
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Repair Tickets
CREATE TABLE repair_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  device_type TEXT NOT NULL,
  device_brand TEXT NOT NULL,
  device_model TEXT NOT NULL,
  issue_description TEXT NOT NULL,
  status TEXT DEFAULT 'received',
  priority TEXT DEFAULT 'normal',
  estimated_cost DECIMAL(10,2),
  final_cost DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_completion TIMESTAMPTZ
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  image_hint TEXT,
  is_featured BOOLEAN DEFAULT false,
  condition TEXT,
  seller_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tickets_customer ON repair_tickets(customer_id);
CREATE INDEX idx_tickets_status ON repair_tickets(status);
CREATE INDEX idx_tickets_number ON repair_tickets(ticket_number);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);

-- Enable Row Level Security
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies (example)
CREATE POLICY "Customers can view their own tickets"
  ON repair_tickets FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all tickets"
  ON repair_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

#### 3.4 API Routes Example

```typescript
// src/app/api/tickets/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('repair_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tickets: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  
  const { data, error } = await supabaseAdmin
    .from('repair_tickets')
    .insert([{
      ...body,
      ticket_number: await generateTicketNumber(),
    }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

#### 3.5 Real-time Subscriptions

```typescript
// In a React component
useEffect(() => {
  const subscription = supabase
    .channel('tickets')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'repair_tickets' },
      (payload) => {
        console.log('Change received!', payload);
        // Update local state
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

#### 3.6 Pros & Cons

**Pros:**
✅ PostgreSQL + real-time subscriptions  
✅ Built-in authentication  
✅ File storage included  
✅ Generous free tier  
✅ Row Level Security built-in  
✅ Great developer experience  
✅ Works well with Next.js  

**Cons:**
❌ Another service to manage  
❌ Learning curve if new to Supabase  
❌ Can be vendor lock-in  

---

## Recommendation & Decision Matrix

### Quick Decision Guide

| Scenario | Recommended Option |
|----------|-------------------|
| **Already familiar with Firebase** | Option 1: Firebase |
| **Need real-time updates** | Option 1: Firebase or Option 3: Supabase |
| **Prefer PostgreSQL/SQL** | Option 3: Supabase |
| **Need complex queries/joins** | Option 2: Prisma + Postgres or Option 3: Supabase |
| **Want fastest setup** | Option 1: Firebase (already integrated) |
| **Budget conscious** | Option 1: Firebase or Option 3: Supabase (both have good free tiers) |
| **Future mobile app planned** | Option 1: Firebase |

### My Recommendation: **Option 1 (Firebase) OR Option 3 (Supabase)**

**For RepairHub, I recommend Firebase (Option 1)** because:

1. ✅ **Already integrated** - Firebase is already in package.json and apphosting.yaml
2. ✅ **Real-time is crucial** - Ticket tracking needs live updates
3. ✅ **Quick to market** - Can implement in days, not weeks
4. ✅ **Genkit integration** - Works seamlessly with your AI chatbot
5. ✅ **Scalable** - Can handle growth easily
6. ✅ **Free tier** - Sufficient for startup phase

**However, if you prefer SQL and PostgreSQL (as mentioned in blueprint):**
- Choose **Option 3 (Supabase)** for the best of both worlds

---

## Implementation Roadmap

### Phase 1: Basic Backend (Week 1)
- [ ] Set up Firebase/Supabase project
- [ ] Create database schema/collections
- [ ] Implement tickets API (CRUD)
- [ ] Implement products API (CRUD)
- [ ] Update admin dashboard to use real APIs
- [ ] Migrate from mock data

### Phase 2: Authentication (Week 2)
- [ ] Set up Firebase Auth or Supabase Auth
- [ ] Add login/signup pages
- [ ] Implement role-based access (admin/customer)
- [ ] Protect admin routes
- [ ] Add customer dashboard

### Phase 3: E-commerce (Week 3)
- [ ] Implement orders API
- [ ] Add shopping cart functionality
- [ ] Integrate payment gateway (M-Pesa/Stripe)
- [ ] Order tracking
- [ ] Email notifications

### Phase 4: Advanced Features (Week 4)
- [ ] Real-time ticket updates
- [ ] File upload (device photos)
- [ ] Analytics dashboard with real data
- [ ] SMS notifications (Africa's Talking)
- [ ] Customer ticket submission form

### Phase 5: AI Enhancement
- [ ] Update AI chatbot to use real database
- [ ] Add chat history persistence
- [ ] Implement customer chat sessions
- [ ] Add AI-powered ticket categorization

---

## Environment Variables Needed

Create `.env.local`:

```bash
# Firebase (Option 1)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# OR Supabase (Option 3)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OR PostgreSQL (Option 2)
DATABASE_URL=postgresql://user:password@host:5432/database

# Google AI (already configured)
GOOGLE_GENAI_API_KEY=

# Payment (later)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
```

---

## Migration Strategy from Mock Data

### Step-by-step Migration

1. **Keep mock data initially**
   ```typescript
   // src/lib/data-source.ts
   const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true';
   
   export async function getTickets() {
     if (USE_REAL_API) {
       const res = await fetch('/api/tickets');
       return res.json();
     }
     return mockTickets;
   }
   ```

2. **Seed database with mock data**
   ```typescript
   // scripts/seed-database.ts
   import { mockTickets, mockProducts } from '@/lib/mock-data';
   import { db } from '@/lib/firebase-admin';
   
   async function seed() {
     // Add all mock tickets to Firestore
     for (const ticket of mockTickets) {
       await db.collection('tickets').add(ticket);
     }
   }
   ```

3. **Gradually switch over**
   - Start with read-only operations
   - Test thoroughly
   - Enable writes
   - Remove mock data

---

## Testing Strategy

```typescript
// __tests__/api/tickets.test.ts
import { GET, POST } from '@/app/api/tickets/route';

describe('Tickets API', () => {
  it('should fetch all tickets', async () => {
    const response = await GET();
    const data = await response.json();
    expect(data.tickets).toBeInstanceOf(Array);
  });

  it('should create a new ticket', async () => {
    const request = new Request('http://localhost:3000/api/tickets', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Test User',
        deviceBrand: 'Apple',
        deviceModel: 'iPhone 13',
        issueDescription: 'Screen cracked',
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

---

## Cost Estimation

### Firebase (Option 1)
- **Free tier**: 50K reads, 20K writes, 1GB storage per day
- **Estimated cost at 1000 active tickets/day**: $0 (within free tier)
- **At scale (10K tickets/day)**: ~$50-100/month

### Supabase (Option 3)
- **Free tier**: 500MB database, 1GB file storage, 2GB bandwidth
- **Estimated cost**: $0 initially
- **Pro plan**: $25/month (8GB database, 100GB bandwidth)

### Self-hosted Postgres (Option 2)
- **Neon free tier**: 10GB storage
- **Railway**: ~$10-20/month
- **Plus**: ~$5-10/month for hosting Next.js app

---

## Next Steps

1. **Choose your backend option** based on the decision matrix above
2. **Set up the development environment** with the chosen solution
3. **Create database schema** 
4. **Implement API routes** for tickets first (most critical)
5. **Test thoroughly** before removing mock data
6. **Deploy** to staging environment
7. **Migrate production data** (if any)

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)

---

## Questions to Answer Before Starting

1. Do you prefer document-based (Firebase) or relational (SQL) database?
2. Do you need real-time updates for ticket tracking?
3. What is your budget for backend services?
4. Do you plan to build a mobile app in the future?
5. What payment gateway will you use (M-Pesa, Stripe, etc.)?
6. Do you have existing data to migrate?

Once you answer these questions, I can help you implement the chosen backend solution step by step!
