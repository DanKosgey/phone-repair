# Feature Toggle System Documentation

## Overview

This document explains how the feature toggle system works in the Phone Repair application. Feature toggles allow administrators to enable or disable specific features without deploying new code, providing flexibility to control which functionality is available to users.

## Core Features

The system currently supports toggling these core features:
1. **Product Shop** - Enables the product shopping section
2. **Repair Tracking** - Enables the ticket tracking system
3. **Second-Hand Products** - Enables the second-hand product marketplace

## System Architecture

### Configuration Storage
Feature settings are stored in the browser's localStorage with the key `featureSettings`. The settings are persisted between sessions.

### Data Structure
```typescript
interface FeatureSettings {
  enableSecondHandProducts: boolean;
  enableTracking: boolean;
  enableShop: boolean;
}
```

### Real-time Updates
The system now supports real-time updates. When feature settings are changed in the admin panel, all components throughout the application automatically update to reflect the new settings without requiring a page refresh.

## Implementation Details

### 1. Configuration Service
Located at `src/lib/feature-toggle.ts`, this module provides functions to:
- Get feature settings from localStorage
- Save feature settings to localStorage
- Get individual feature setting values
- Notify listeners of feature setting changes

### 2. React Hook
Located at `src/hooks/use-feature-toggle.ts`, this hook provides easy access to feature settings in React components:
```typescript
import { useFeatureToggle } from '@/hooks/use-feature-toggle';

export default function MyComponent() {
  const { enableShop, enableTracking, enableSecondHandProducts, loading } = useFeatureToggle();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {enableShop && <ProductShopSection />}
      {enableTracking && <TrackingSection />}
      {enableSecondHandProducts && <SecondHandProductsSection />}
    </div>
  );
}
```

### 3. Admin Interface
Feature toggles are managed through the Settings page (`/admin/settings`) under the "Features" tab. Administrators can toggle features on/off using switches.

### 4. Conditional Rendering
Components are conditionally rendered based on feature settings:
```typescript
{enableShop && (
  <Suspense fallback={<LoadingSkeleton />}>
    <FeaturedProductsSection />
  </Suspense>
)}
```

## How to Add New Features

1. **Update the FeatureSettings interface** in `src/lib/feature-toggle.ts`:
   ```typescript
   interface FeatureSettings {
     // ... existing features
     enableNewFeature: boolean;
   }
   ```

2. **Update the default settings** in `src/lib/feature-toggle.ts`:
   ```typescript
   const DEFAULT_FEATURE_SETTINGS: FeatureSettings = {
     // ... existing features
     enableNewFeature: true, // or false
   }
   ```

3. **Add the toggle to the admin interface** in `src/components/admin/Settings.tsx`:
   ```typescript
   <div className="flex items-center justify-between">
     <div className="flex items-center gap-3">
       <NewFeatureIcon className="h-5 w-5 text-muted-foreground" />
       <div>
         <p className="font-medium">New Feature</p>
         <p className="text-sm text-muted-foreground">Description of the new feature</p>
       </div>
     </div>
     <Switch
       checked={featureSettings.enableNewFeature}
       onCheckedChange={(checked) => handleFeatureSettingsChange('enableNewFeature', checked)}
     />
   </div>
   ```

4. **Use the feature toggle in components**:
   ```typescript
   import { useFeatureToggle } from '@/hooks/use-feature-toggle';
   
   export default function MyComponent() {
     const { enableNewFeature } = useFeatureToggle();
     
     return (
       <div>
         {enableNewFeature && <NewFeatureComponent />}
       </div>
     );
   }
   ```

## Testing Instructions

### Manual Testing
1. Open two browser tabs - one on the homepage and one on the admin settings page
2. In the settings tab, disable a feature (e.g., Product Shop)
3. Save the settings
4. The homepage tab should immediately update:
   - Navigation links should disappear
   - Buttons should disappear
   - Sections should be hidden

### Programmatic Testing
To test in browser console:
```javascript
// Check current settings
console.log(localStorage.getItem('featureSettings'))

// Disable shop feature
localStorage.setItem('featureSettings', JSON.stringify({enableSecondHandProducts: true, enableTracking: true, enableShop: false}))

// The UI should update automatically without page refresh
```

## Troubleshooting

### Feature changes not appearing
- Ensure you're using the `useFeatureToggle` hook in your components
- Check browser console for JavaScript errors
- Verify localStorage contains the correct settings

### Performance issues
- Use dynamic imports with Suspense for heavy components
- Avoid unnecessary re-renders by memoizing components where appropriate