# Jay's Phone Repair - Mobile App

A beautiful, full-featured React Native mobile application for Jay's Phone Repair, built with Expo for iOS and Android.

## 🚀 Quick Start (No Android Studio Required!)

### Option 1: Test on Your Phone (Recommended - Easiest!)

1. **Install Expo Go on your phone:**
   - iOS: [Download from App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Download from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the development server:**
   ```bash
   cd mobile-app
   npm start
   ```

3. **Scan the QR code:**
   - iOS: Open Camera app and scan the QR code
   - Android: Open Expo Go app and scan the QR code

4. **The app will load on your phone!** 📱

### Option 2: Test in Web Browser

```bash
npm run web
```

This opens the app in your browser at `http://localhost:8081`

### Option 3: Android Emulator (Requires Android Studio)

Only if you want to use an emulator:

1. Install [Android Studio](https://developer.android.com/studio)
2. Set up Android SDK and emulator
3. Set ANDROID_HOME environment variable
4. Run: `npm run android`

## Features

### For Customers
- 📱 **Track Repairs**: Search and track repair status by ticket number
- 🛍️ **Browse Products**: Shop for phone accessories and parts
- 👤 **Profile Management**: View and manage account information
- 🔔 **Push Notifications**: Get notified about repair status updates (coming soon)
- 📷 **Photo Gallery**: View photos of your repair progress

### For Admins
- 📊 **Dashboard**: View key metrics and statistics
- 🎫 **Ticket Management**: Manage all repair tickets
- 📷 **Camera Integration**: Take and upload repair photos (coming soon)
- 👥 **Customer Management**: View and manage customer information
- 📈 **Analytics**: Track business performance

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Backend**: Supabase (Authentication, Database, Storage)
- **Navigation**: React Navigation
- **State Management**: React Hooks
- **UI**: Custom components with modern design

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- **For phone testing**: Expo Go app (free)
- **For emulator testing**: Android Studio or Xcode

## Installation

1. **Navigate to the mobile app directory**:
   ```bash
   cd mobile-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   
   You need to add your Supabase credentials. Create a `.env` file or add to `app.json`:
   
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   **Where to find these:**
   1. Go to your Supabase dashboard
   2. Click "Settings" → "API"
   3. Copy "Project URL" and "anon/public" key

## Running the App

### Development Mode

Start the Expo development server:
```bash
npm start
```

This will show a QR code and menu:
- Press `w` to open in web browser
- Scan QR code with Expo Go app on your phone
- Press `i` for iOS Simulator (Mac only, requires Xcode)
- Press `a` for Android Emulator (requires Android Studio setup)

### Quick Commands

```bash
npm run web      # Run in web browser (easiest for testing)
npm run ios      # Run on iOS Simulator (Mac only)
npm run android  # Run on Android Emulator (requires setup)
```

## Testing the App

### Test with Existing Accounts

Use the same accounts from your web app:

**Admin Account:**
- Login with your admin credentials from the web app

**Customer Account:**
- Login with any customer account from the web app

### What to Test

**Customer Flow:**
1. ✅ Login with customer account
2. ✅ View dashboard with recent repairs
3. ✅ Track a repair by ticket number
4. ✅ Browse products
5. ✅ View profile and sign out

**Admin Flow:**
1. ✅ Login with admin account
2. ✅ View dashboard with statistics (Pending, In Progress, Completed)
3. ✅ See recent tickets
4. ✅ View profile

## Project Structure

```
mobile-app/
├── screens/              # Screen components
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── CustomerDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── TrackRepairScreen.tsx
│   ├── ProductsScreen.tsx
│   └── ProfileScreen.tsx
├── services/            # API and services
│   └── supabase.ts      # Supabase client configuration
├── hooks/               # Custom React hooks
│   └── useAuth.ts       # Authentication hook
├── constants/           # App constants
│   └── theme.ts         # Design system (colors, spacing, typography)
├── assets/              # Images, icons, fonts
├── App.tsx              # Main app component with navigation
└── app.json             # Expo configuration
```

## Building for Production

### Using Expo Application Services (EAS)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure build:**
   ```bash
   eas build:configure
   ```

4. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

5. **Build for Android:**
   ```bash
   eas build --platform android
   ```

### Submitting to App Stores

**iOS (requires Apple Developer Account - $99/year):**
```bash
eas submit --platform ios
```

**Android (requires Google Play Developer Account - $25 one-time):**
```bash
eas submit --platform android
```

## Troubleshooting

### "Cannot connect to Supabase"
- ✅ Check that your `.env` file has the correct Supabase URL and key
- ✅ Verify the Supabase project is running
- ✅ Check your internet connection

### "Metro bundler error"
Clear the cache:
```bash
npm start -- --reset-cache
```

### "Module not found"
Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

### Android SDK Error (like you're seeing)
**You don't need Android Studio for testing!** Instead:
1. Use Expo Go on your phone (recommended)
2. Or run in web browser with `npm run web`

If you really want Android emulator:
1. Install Android Studio
2. Set up Android SDK
3. Add to environment variables:
   ```
   ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
   ```

### iOS Simulator not opening
- Requires Mac with Xcode installed
- Alternative: Use Expo Go on iPhone

## Version Compatibility

If you see package version warnings, fix with:
```bash
npx expo install --fix
```

## Next Steps

1. **Test the app:**
   - Install Expo Go on your phone
   - Run `npm start`
   - Scan QR code

2. **Customize the app:**
   - Update app icon in `assets/icon.png`
   - Update splash screen in `assets/splash.png`
   - Modify colors in `constants/theme.ts`

3. **Add features:**
   - Push notifications for repair updates
   - Camera integration for uploading photos
   - Offline mode for viewing repairs

4. **Deploy to app stores:**
   - Follow the EAS build steps above
   - Prepare app store assets (screenshots, descriptions)
   - Submit for review

## Support

For issues or questions:
- Check [Expo Documentation](https://docs.expo.dev/)
- Check [Supabase Documentation](https://supabase.com/docs)
- Check [React Native Documentation](https://reactnative.dev/)

## License

Private - Jay's Phone Repair
