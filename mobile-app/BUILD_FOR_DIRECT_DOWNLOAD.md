# Build Instructions for Direct Download Deployment

This document provides step-by-step instructions for building the app for direct download deployment.

## Prerequisites

1. Node.js installed
2. Expo CLI installed (`npm install -g expo-cli`)
3. EAS CLI installed (`npm install -g eas-cli`)
4. Logged into Expo account (`eas login`)

## Building for Direct Download

### 1. Login to Expo/EAS
```bash
eas login
```

### 2. Build Android APK for Direct Download
```bash
eas build -p android --profile preview
```

This will:
- Build an APK file for Android
- Make it available for direct download
- Not require Google Play Store submission

### 3. Build Web Version
```bash
expo export:web
```

This will:
- Generate a web build in the `web-build` folder
- Create PWA files for iOS users
- Enable direct browser access

## Deployment Structure

After building, you'll have:
```
mobile-app/
├── web-build/           # Web version files
├── eas-builds/          # Location where EAS puts APK (when downloaded)
└── ... (other files)
```

## Deployment Steps

### 1. Deploy Web Version
1. Copy contents of `web-build` folder
2. Deploy to your web hosting in the `/app` directory

### 2. Deploy Android APK
1. Download the APK from Expo/EAS dashboard
2. Place it in your web hosting `/downloads` directory
3. Rename to `jays-phone-repair.apk`

### 3. Update Homepage Links
Ensure your homepage download section points to the correct URLs:
- Android APK: `/downloads/jays-phone-repair.apk`
- Web App: `/app`

## Testing the Deployment

### Test Android Download:
1. Visit your homepage on an Android device
2. Click "Download APK"
3. Open the downloaded file
4. Install and test the app

### Test iOS PWA:
1. Visit your homepage on an iPhone
2. Open in Safari browser
3. Tap "Install on iPhone (PWA)"
4. Add to Home Screen
5. Test the installed app

### Test Web Version:
1. Visit `https://yourdomain.com/app`
2. Test all app functionality in browser

## Troubleshooting

### Common Build Issues:

1. **EAS Build Fails**:
   - Check Expo logs for specific errors
   - Ensure all dependencies are installed (`npm install`)
   - Verify app.json configuration

2. **APK Download Issues**:
   - Ensure correct file path on server
   - Check web server MIME type for APK files
   - Verify SSL certificate if using HTTPS

3. **PWA Installation Problems**:
   - Test in Safari browser only (iOS limitation)
   - Check that manifest.json is accessible
   - Verify service worker registration

### Build Commands Reference:

```bash
# Build Android APK
eas build -p android --profile preview

# Build for development/testing
eas build -p android --profile development

# Build web version
expo export:web

# View build logs
eas build:list

# Download build artifacts
eas build:download
```

## Updating the App

To release updates:

1. Make your code changes
2. Rebuild the APK: `eas build -p android --profile preview`
3. Redeploy the web version: `expo export:web`
4. Replace files on your web server
5. Users will need to manually download/install updates

Note: For automatic web updates, the PWA will update when users refresh. For APK updates, users must manually download and install the new version.

## Support Resources

- Expo Documentation: https://docs.expo.dev/
- EAS CLI Documentation: https://docs.expo.dev/build-reference/eas-json/
- Progressive Web Apps: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps