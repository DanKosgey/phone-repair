# 🚀 Quick Start Guide - Mobile App

## Easiest Way to Test (No Android Studio Needed!)

### Step 1: Install Expo Go on Your Phone

**iPhone:**
- Open App Store
- Search for "Expo Go"
- Install the app

**Android:**
- Open Google Play Store
- Search for "Expo Go"
- Install the app

### Step 2: Start the Development Server

Open your terminal in the mobile-app folder and run:

```bash
npm start
```

You'll see something like this:
```
› Metro waiting on exp://192.168.1.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
```

### Step 3: Open on Your Phone

**iPhone:**
1. Open your Camera app
2. Point it at the QR code on your terminal
3. Tap the notification that appears
4. The app will open in Expo Go!

**Android:**
1. Open the Expo Go app
2. Tap "Scan QR Code"
3. Point at the QR code on your terminal
4. The app will load!

### Step 4: Test the App

**Login with your existing accounts:**
- Use the same email/password from your web app
- Admin accounts will see the admin dashboard
- Customer accounts will see the customer dashboard

## Alternative: Test in Web Browser

If you don't have a phone handy, run:

```bash
npm run web
```

This opens the app in your browser at `http://localhost:8081`

## What You'll See

### Customer App
- **Dashboard**: Recent repairs and quick actions
- **Track**: Search for repairs by ticket number
- **Products**: Browse available products
- **Profile**: View account info and sign out

### Admin App
- **Dashboard**: Statistics (Pending, In Progress, Completed, Total)
- **Recent Tickets**: Latest repair tickets
- **Profile**: Account info and sign out

## Common Issues

### "Cannot connect to development server"
- Make sure your phone and computer are on the same WiFi network
- Try running `npm start -- --tunnel` for a public URL

### "Supabase connection error"
- You need to add your Supabase credentials
- See SETUP.md for instructions

### Package version warnings
- Run: `npx expo install --fix`
- This will install compatible versions

## Next Steps

1. ✅ Test login with your accounts
2. ✅ Browse around the app
3. ✅ Check that data matches your web app
4. 📝 Customize the app (colors, icons, etc.)
5. 🚀 Build for production when ready

## Need Help?

- Check README.md for full documentation
- Check SETUP.md for configuration details
- Visit https://docs.expo.dev/ for Expo help

---

**That's it! You now have a working mobile app!** 🎉

No Android Studio, no Xcode, no complicated setup. Just install Expo Go and scan the QR code!
