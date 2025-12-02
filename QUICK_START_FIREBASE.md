# 🚀 Quick Start: Firebase Backend Implementation

## Get Your Backend Running in 30 Minutes!

This guide will help you set up a working Firebase backend for RepairHub in **under 30 minutes**.

---

## ✅ Prerequisites

- [ ] Node.js installed (already have it)
- [ ] Google account
- [ ] 30 minutes of focused time

---

## 🎯 Step-by-Step Implementation

### Step 1: Create Firebase Project (5 minutes)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Add project"

2. **Project Setup**
   ```
   Project name: repairhub (or your choice)
   ✅ Enable Google Analytics (optional but recommended)
   Click: Create project
   ```

3. **Wait for project creation** (~30 seconds)

4. **Add a Web App**
   ```
   Click: Web icon (</>)
   App nickname: RepairHub Web
   ✅ Also set up Firebase Hosting
   Click: Register app
   ```

5. **Copy Configuration**
   ```javascript
   // You'll see something like this - SAVE IT!
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "repairhub.firebaseapp.com",
     projectId: "repairhub",
     storageBucket: "repairhub.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### Step 2: Enable Firebase Services (3 minutes)

1. **Enable Firestore Database**
   ```
   Left sidebar → Build → Firestore Database
   Click: Create database
   Mode: Start in test mode (we'll secure later)
   Location: Choose closest to you
   Click: Enable
   ```

2. **Enable Authentication**
   ```
   Left sidebar → Build → Authentication
   Click: Get started
   Sign-in providers → Email/Password
   ✅ Enable
   Click: Save
   ```

3. **Enable Storage**
   ```
   Left sidebar → Build → Storage
   Click: Get started
   Mode: Start in test mode
   Click: Done
   ```

### Step 3: Install Firebase in Your Project (2 minutes)

```bash
# In your project directory (/workspace)
npm install firebase-admin firebase

# Install Firebase CLI globally (for deployment)
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### Step 4: Set Up Environment Variables (2 minutes)

1. **Create `.env.local` file** (in /workspace root):

```bash
# Copy this template and fill in your values from Step 1

# Firebase Client Config (from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Service Account)
# Get from: Firebase Console → Project Settings → Service Accounts → Generate new private key
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"

# Google AI (you already have this)
GOOGLE_GENAI_API_KEY=your_existing_key
```

2. **Get Service Account Key:**
   ```
   Firebase Console → Project Settings (⚙️)
   → Service accounts tab
   → Generate new private key
   → Click: Generate key (downloads JSON file)
   ```

3. **Extract values from downloaded JSON:**
   ```json
   {
     "project_id": "← use this",
     "private_key": "← use this",
     "client_email": "← use this"
   }
   ```

### Step 5: Create Firebase Configuration Files (5 minutes)

#### A. Client-side Firebase (`src/lib/firebase-client.ts`)

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

#### B. Server-side Firebase Admin (`src/lib/firebase-admin.ts`)

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin (only once)
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

// Export Firebase Admin services
export const adminDb = getFirestore();
export const adminAuth = getAuth();
export const adminStorage = getStorage();
```

### Step 6: Seed Database with Mock Data (5 minutes)

Create `scripts/seed-firebase.ts`:

```typescript
import { adminDb } from '@/lib/firebase-admin';
import { mockTickets, mockProducts, mockSecondHandProducts } from '@/lib/mock-data';

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Seed tickets
    console.log('Adding tickets...');
    const ticketsRef = adminDb.collection('tickets');
    for (const ticket of mockTickets) {
      await ticketsRef.add(ticket);
    }
    console.log(`✅ Added ${mockTickets.length} tickets`);

    // Seed products
    console.log('Adding products...');
    const productsRef = adminDb.collection('products');
    for (const product of mockProducts) {
      await productsRef.add(product);
    }
    console.log(`✅ Added ${mockProducts.length} products`);

    // Seed second-hand products
    console.log('Adding second-hand products...');
    for (const product of mockSecondHandProducts) {
      await productsRef.add(product);
    }
    console.log(`✅ Added ${mockSecondHandProducts.length} second-hand products`);

    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seedDatabase();
```

Add to `package.json` scripts:
```json
{
  "scripts": {
    "seed": "tsx scripts/seed-firebase.ts"
  }
}
```

Install tsx and run:
```bash
npm install -D tsx
npm run seed
```

### Step 7: Create Your First API Route (5 minutes)

Create `src/app/api/tickets/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { RepairTicket } from '@/lib/types';

// GET all tickets
export async function GET(request: NextRequest) {
  try {
    const ticketsSnapshot = await adminDb
      .collection('tickets')
      .orderBy('createdAt', 'desc')
      .get();

    const tickets: RepairTicket[] = [];
    ticketsSnapshot.forEach((doc) => {
      tickets.push({
        id: doc.id,
        ...doc.data(),
      } as RepairTicket);
    });

    return NextResponse.json({ tickets, count: tickets.length });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST new ticket
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Generate ticket number
    const ticketsCount = await adminDb.collection('tickets').count().get();
    const ticketNumber = `RPR-${new Date().getFullYear()}-${String(ticketsCount.data().count + 1).padStart(4, '0')}`;

    const newTicket = {
      ...data,
      ticketNumber,
      status: 'received',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await adminDb.collection('tickets').add(newTicket);

    return NextResponse.json(
      { id: docRef.id, ...newTicket },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
```

### Step 8: Test Your API (3 minutes)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test in browser or with curl:**
   ```bash
   # Get all tickets
   curl http://localhost:9002/api/tickets

   # Should return JSON with your tickets!
   ```

3. **Or visit in browser:**
   ```
   http://localhost:9002/api/tickets
   ```

You should see your seeded tickets! 🎉

---

## 🎨 Update Admin Dashboard to Use API

Update `src/app/admin/tickets/page.tsx`:

```typescript
// Replace this line:
// import { mockTickets } from "@/lib/mock-data";

// With:
import { useEffect, useState } from 'react';

// Inside the component:
export default function TicketsPage() {
  const [allTickets, setAllTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      setAllTickets(data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading tickets...</div>;
  }

  // Rest of your component stays the same...
  const sortedTickets = useMemo(() => {
    return [...allTickets].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [allTickets]);

  // ... rest of component
}
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Firebase project created
- [ ] Firestore, Auth, Storage enabled
- [ ] Environment variables set in `.env.local`
- [ ] Firebase client config created (`firebase-client.ts`)
- [ ] Firebase admin config created (`firebase-admin.ts`)
- [ ] Database seeded with mock data
- [ ] API route `/api/tickets` working
- [ ] Can fetch tickets from Firestore
- [ ] Admin dashboard loads real data

---

## 🐛 Troubleshooting

### Problem: "Firebase not initialized"
**Solution:** Check `.env.local` has all variables and restart dev server

### Problem: "Permission denied"
**Solution:** Firestore rules are too restrictive. Temporarily use:
```javascript
// Firestore Rules (Firebase Console)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ Only for development!
    }
  }
}
```

### Problem: "Can't find module firebase-admin"
**Solution:**
```bash
npm install firebase-admin firebase
# Restart dev server
```

### Problem: "Private key format error"
**Solution:** Make sure private key in `.env.local` keeps `\n` and is wrapped in quotes:
```
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nKey\n-----END PRIVATE KEY-----\n"
```

---

## 🎯 Next Steps

Once your basic API is working:

1. **Create more API routes:**
   - [ ] `/api/tickets/[id]` - Get/Update/Delete single ticket
   - [ ] `/api/products` - Products CRUD
   - [ ] `/api/orders` - Orders CRUD

2. **Add Authentication:**
   - [ ] Login page
   - [ ] Signup page
   - [ ] Protect admin routes

3. **Real-time Updates:**
   - [ ] Use Firestore listeners in components
   - [ ] See changes instantly across users

4. **File Uploads:**
   - [ ] Upload device photos
   - [ ] Store in Firebase Storage

5. **Update AI Chatbot:**
   - [ ] Connect to real Firestore data
   - [ ] Query actual tickets

---

## 📚 Resources

- **Firebase Console:** https://console.firebase.google.com/
- **Firestore Docs:** https://firebase.google.com/docs/firestore
- **Firebase Admin SDK:** https://firebase.google.com/docs/admin/setup
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 🎉 Congratulations!

You now have a working Firebase backend! Your RepairHub app can:
- ✅ Store data persistently
- ✅ Fetch real tickets from database
- ✅ Scale to millions of records
- ✅ Ready for authentication
- ✅ Ready for real-time updates

**Next:** Follow the full implementation guide in `BACKEND_IMPLEMENTATION_GUIDE.md` to complete all features!

---

## 💬 Need Help?

If you get stuck:
1. Check Firebase Console for errors
2. Check browser console for errors
3. Verify all environment variables are set
4. Restart your dev server after changing `.env.local`
5. Review the troubleshooting section above

Happy coding! 🚀
