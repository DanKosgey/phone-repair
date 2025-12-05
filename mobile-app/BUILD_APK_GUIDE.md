# Building APK for Direct Download

## Step-by-Step Guide to Build Android APK

### 1. Install EAS CLI (One-time setup)

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

If you don't have an Expo account:
- Go to https://expo.dev/signup
- Create a free account
- Then run `eas login` and enter your credentials

### 3. Configure the Build

```bash
cd mobile-app
eas build:configure
```

This will ask a few questions - just press Enter to accept defaults.

### 4. Build the APK

```bash
eas build --platform android --profile preview
```

**What happens:**
- Expo builds your app in the cloud (free for limited builds)
- Takes about 10-15 minutes
- You'll get a download link for the APK file

### 5. Download the APK

Once the build completes, you'll see:
```
✔ Build finished
APK: https://expo.dev/artifacts/eas/[your-build-id].apk
```

Click the link to download the APK file (e.g., `jays-phone-repair.apk`)

### 6. Host the APK on Your Website

**Option A: Put in public folder**
1. Copy the APK to your web app:
   ```bash
   mkdir c:\Users\PC\OneDrive\Desktop\jays\phone-repair\public\downloads
   # Copy the downloaded APK there
   ```

2. The APK will be available at: `https://yourwebsite.com/downloads/jays-phone-repair.apk`

**Option B: Use a file hosting service**
- Upload to Google Drive, Dropbox, or AWS S3
- Get a public download link

### 7. Update Download Button

The download button in `DownloadAppSection.tsx` is already set up. Just update the href:

```typescript
<a
  href="/downloads/jays-phone-repair.apk"  // Update this path
  download
  className="..."
>
  Download for Android
</a>
```

## Testing the APK

### On Your Android Phone:

1. **Enable Unknown Sources:**
   - Go to Settings → Security
   - Enable "Install unknown apps" for your browser

2. **Download the APK:**
   - Visit your website on your phone
   - Click "Download for Android"
   - APK downloads

3. **Install:**
   - Tap the downloaded APK
   - Click "Install"
   - Done! App is installed

## Updating the App

When you make changes:

1. **Increment version** in `app.json`:
   ```json
   "version": "1.0.1"  // Change from 1.0.0
   ```

2. **Build new APK:**
   ```bash
   eas build --platform android --profile preview
   ```

3. **Replace old APK** with new one on your website

4. **Users download** the new version and install (it will update the existing app)

## Alternative: Expo's Direct Download

Instead of hosting yourself, you can use Expo's link:

After building, Expo gives you a permanent link like:
```
https://expo.dev/accounts/[username]/projects/jays-phone-repair/builds/[build-id]
```

You can use this link directly in your download button!

## Cost

- **Expo Free Plan**: 15 builds/month (plenty for updates)
- **Expo Production Plan**: $29/month for unlimited builds (if needed)

## Important Notes

### Android Security Warning

When users install, Android will show:
> "This app is from an unknown source. Install anyway?"

This is normal for apps not from Google Play. Users just click "Install anyway."

To remove this warning, you'd need to publish to Google Play Store ($25 one-time fee).

### iOS Alternative

For iOS users, you have two options:

1. **PWA (Recommended)**: They can "Add to Home Screen" - works like an app
2. **TestFlight**: Beta testing (free, but limited to 10,000 users)
3. **App Store**: Full release ($99/year)

## Quick Reference

```bash
# Build APK
eas build --platform android --profile preview

# Check build status
eas build:list

# View build details
eas build:view [build-id]
```

## Next Steps

1. Run `eas login` (create account if needed)
2. Run `eas build --platform android --profile preview`
3. Wait 10-15 minutes
4. Download the APK
5. Host it on your website
6. Update the download link
7. Test on your Android phone!
