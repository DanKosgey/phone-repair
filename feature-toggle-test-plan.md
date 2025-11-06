# Feature Toggle Test Plan

## Overview
This document outlines the test plan to verify that feature toggles correctly show/hide homepage sections and buttons while keeping the actual pages accessible.

## Test Scenarios

### 1. Product Shop Feature Toggle
**Test Case 1.1: Disable Product Shop**
- Go to Admin Settings → Features
- Toggle "Product Shop" to OFF
- Save settings
- **Expected Results:**
  - "Shop Products" button should disappear from HeroSection
  - Featured Products section should disappear from homepage
  - "Shop Products" link should disappear from Navbar
  - "Shop Products" link should disappear from MobileMenu
  - Direct access to `/products` should still work

**Test Case 1.2: Enable Product Shop**
- Go to Admin Settings → Features
- Toggle "Product Shop" to ON
- Save settings
- **Expected Results:**
  - "Shop Products" button should appear in HeroSection
  - Featured Products section should appear on homepage
  - "Shop Products" link should appear in Navbar
  - "Shop Products" link should appear in MobileMenu

### 2. Second-Hand Products Feature Toggle
**Test Case 2.1: Disable Second-Hand Products**
- Go to Admin Settings → Features
- Toggle "Second-Hand Products" to OFF
- Save settings
- **Expected Results:**
  - "Device Marketplace" button should disappear from HeroSection
  - Second-Hand Products section should disappear from homepage
  - "Device Marketplace" link should disappear from Navbar
  - "Device Marketplace" link should disappear from MobileMenu
  - Direct access to `/marketplace` should still work

**Test Case 2.2: Enable Second-Hand Products**
- Go to Admin Settings → Features
- Toggle "Second-Hand Products" to ON
- Save settings
- **Expected Results:**
  - "Device Marketplace" button should appear in HeroSection
  - Second-Hand Products section should appear on homepage
  - "Device Marketplace" link should appear in Navbar
  - "Device Marketplace" link should appear in MobileMenu

### 3. Repair Tracking Feature Toggle
**Test Case 3.1: Disable Repair Tracking**
- Go to Admin Settings → Features
- Toggle "Repair Tracking" to OFF
- Save settings
- **Expected Results:**
  - "Track Repair" button should disappear from HeroSection
  - Track Ticket CTA section should disappear from homepage
  - "Track Repair" link should disappear from Navbar
  - "Track Repair" link should disappear from MobileMenu
  - Direct access to `/track` should still work

**Test Case 3.2: Enable Repair Tracking**
- Go to Admin Settings → Features
- Toggle "Repair Tracking" to ON
- Save settings
- **Expected Results:**
  - "Track Repair" button should appear in HeroSection
  - Track Ticket CTA section should appear on homepage
  - "Track Repair" link should appear in Navbar
  - "Track Repair" link should appear in MobileMenu

### 4. All Features Disabled
**Test Case 4.1: Disable All Features**
- Go to Admin Settings → Features
- Toggle all features to OFF
- Save settings
- **Expected Results:**
  - All feature buttons should disappear from HeroSection
  - All feature sections should disappear from homepage
  - All feature links should disappear from Navbar
  - All feature links should disappear from MobileMenu
  - Direct access to all pages (`/products`, `/marketplace`, `/track`) should still work

### 5. Real-time Updates
**Test Case 5.1: Real-time Update Verification**
- Open two browser tabs:
  - Tab 1: Homepage
  - Tab 2: Admin Settings
- In Tab 2, disable a feature
- Save settings
- **Expected Results:**
  - Tab 1 should immediately update without page refresh
  - All UI elements should reflect the new feature toggle state

## Testing Instructions

### Manual Testing
1. Open the application in a browser
2. Navigate to the homepage
3. Open the admin settings page in a new tab
4. Toggle features on/off and observe changes on the homepage
5. Verify that direct URL access still works for all pages
6. Check both desktop and mobile views

### Programmatic Testing
To test in browser console:
```javascript
// Check current settings
console.log(localStorage.getItem('featureSettings'))

// Disable shop feature
localStorage.setItem('featureSettings', JSON.stringify({enableSecondHandProducts: true, enableTracking: true, enableShop: false}))

// The UI should update automatically without page refresh
```

## Expected Results Summary
- Feature toggles should only affect homepage sections and navigation links
- Actual pages should remain accessible regardless of feature toggle state
- UI updates should happen in real-time without page refresh
- All components should properly handle loading states
- No errors should occur during feature toggle changes