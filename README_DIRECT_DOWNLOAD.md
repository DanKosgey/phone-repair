# Jay's Phone Repair - Direct Download Deployment

This repository contains the mobile app that can be downloaded and installed directly from the web browser without using app stores.

## Deployment Approach

Instead of distributing through Google Play or Apple App Store, users can:

1. **Android Users**: Download the APK file directly and install it
2. **iOS Users**: Install the app as a Progressive Web App (PWA) via Safari
3. **All Users**: Access the full app functionality directly in their web browser

## How It Works

### Homepage Download Section
The homepage at `https://yourdomain.com` features a "Download App" section with three options:

1. **Download APK** (Android): Direct download of the Android app
2. **Install PWA** (iOS): Instructions for adding the web app to the home screen
3. **Open in Browser**: Access the web version directly

### File Structure for Deployment
```
web-root/
├── downloads/
│   └── jays-phone-repair.apk  # Android app
├── app/                       # Web app files
│   ├── index.html
│   ├── static/
│   └── ... (other web files)
├── index.html                 # Main homepage
└── ... (other website files)
```

## Building for Direct Distribution

### 1. Build Android APK
```bash
cd mobile-app
eas build -p android --profile preview
```

### 2. Build Web Version
```bash
expo export:web
```

## Deployment Steps

1. Place the generated APK in the `downloads` folder
2. Deploy the web build to the `app` folder
3. Deploy the main homepage with the updated download section
4. Test the download and installation process

## User Installation Process

### For Android:
1. Visit the homepage on their Android device
2. Tap "Download APK"
3. Open the downloaded file when complete
4. Allow installation from unknown sources if prompted
5. Follow installation prompts

### For iOS:
1. Visit the homepage in Safari browser
2. Tap "Install on iPhone (PWA)"
3. Follow the on-screen instructions to add to home screen
4. The app will appear on their home screen

### For Web Access:
1. Visit `https://yourdomain.com/app`
2. Use the app directly in the browser
3. No installation required

## Advantages of Direct Download

- No app store approval process
- Immediate deployment of updates
- No app store fees
- Direct control over distribution
- Faster iteration cycles

## Considerations

- Android users must enable "Install from unknown sources"
- iOS PWA has some limitations compared to native apps
- Users must manually update the app
- Some security warnings may appear during installation

## Support

For issues with the direct download deployment:
1. Check that files are in the correct locations
2. Verify web server MIME types for APK files
3. Ensure proper SSL certificates for secure downloads
4. Test installation process on multiple devices