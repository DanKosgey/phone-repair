# Mobile App Setup Guide

## Quick Start

### 1. Set Up Supabase Environment Variables

The mobile app needs to connect to the same Supabase instance as your web app.

**Find your Supabase credentials:**
1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" and "anon/public" key

**Configure the mobile app:**
1. Navigate to the mobile app directory:
   ```bash
   cd mobile-app
   ```

2. Create a `.env` file (or add to your Expo configuration):
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

This will open Expo Dev Tools. From there:
- Press `i` for iOS Simulator (Mac only)
- Press `a` for Android Emulator  
- Scan QR code with Expo Go app on your phone

## Testing the App

### Test Accounts

Use the same accounts from your web app:

**Admin Account:**
- Email: admin@example.com
- Password: (your admin password)

**Customer Account:**
- Email: customer@example.com
- Password: (your customer password)

### Features to Test

**Customer Flow:**
1. Login with customer account
2. View dashboard with recent repairs
3. Track a repair by ticket number
4. Browse products
5. View profile

**Admin Flow:**
1. Login with admin account
2. View dashboard with statistics
3. See recent tickets
4. View profile

## Building for Production

### iOS (Requires Mac + Apple Developer Account)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Configure the build:
   ```bash
   eas build:configure
   ```

4. Build for iOS:
   ```bash
   eas build --platform ios
   ```

5. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

### Android

1. Build for Android:
   ```bash
   eas build --platform android
   ```

2. Submit to Google Play:
   ```bash
   eas submit --platform android
   ```

## Troubleshooting

### "Cannot connect to Supabase"
- Check that your `.env` file has the correct Supabase URL and key
- Verify the Supabase project is running
- Check your internet connection

### "Metro bundler error"
- Clear the cache:
  ```bash
  npm start -- --reset-cache
  ```

### "Module not found"
- Reinstall dependencies:
  ```bash
  rm -rf node_modules
  npm install
  ```

### iOS Simulator not opening
- Make sure Xcode is installed (Mac only)
- Open Xcode and install additional components if prompted

### Android Emulator not opening
- Make sure Android Studio is installed
- Create an Android Virtual Device (AVD) in Android Studio
- Start the emulator before running `npm run android`

## Next Steps

1. **Customize the app:**
   - Update app icon in `assets/icon.png`
   - Update splash screen in `assets/splash.png`
   - Modify colors in `constants/theme.ts`

2. **Add features:**
   - Push notifications for repair updates
   - Camera integration for uploading photos
   - Offline mode for viewing repairs

3. **Deploy to app stores:**
   - Follow the production build steps above
   - Prepare app store assets (screenshots, descriptions)
   - Submit for review

## Support

For issues or questions:
- Check the [Expo Documentation](https://docs.expo.dev/)
- Check the [Supabase Documentation](https://supabase.com/docs)
- Contact support@jaysphonerepair.com
