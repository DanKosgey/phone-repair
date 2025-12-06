@echo off
echo Building Jay's Phone Repair App for Direct Download Deployment
echo ==========================================================

echo.
echo 1. Building Android APK for direct download...
echo -----------------------------------------------
eas build -p android --profile preview

echo.
echo 2. Building web version...
echo ------------------------
expo export:web

echo.
echo Build process completed!
echo.
echo Next steps:
echo 1. Download the APK from Expo dashboard
echo 2. Deploy the web-build folder contents to your web server /app directory
echo 3. Place the APK in your web server /downloads directory
echo 4. Test the download and installation process

pause