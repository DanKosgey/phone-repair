# Camera Feature Implementation

## Overview
This feature adds camera functionality to the product forms and ticket forms, allowing users to capture photos directly from their device's camera instead of only uploading existing images.

## Components

### 1. Camera Component (`src/components/ui/camera.tsx`)
A reusable camera component that provides:
- Camera access with permission handling
- Photo capture with validation
- Responsive design for mobile and desktop
- Error handling for camera access issues
- File size and type validation

#### Props
- `onCapture`: Function called when a photo is captured (receives a File object)
- `onCameraError`: Optional function called when camera access fails
- `maxFileSize`: Maximum file size in bytes (default: 5MB)
- `allowedTypes`: Array of allowed MIME types (default: ['image/jpeg', 'image/png', 'image/webp'])

### 2. Updated Forms
The camera component has been integrated into:
- ProductForm (`src/components/admin/products/ProductForm.tsx`)
- SecondHandProductForm (`src/components/admin/secondhand-products/SecondHandProductForm.tsx`)
- TicketForm (`src/components/admin/tickets/TicketForm.tsx`)

## Implementation Details

### Camera Access
- Uses the browser's `navigator.mediaDevices.getUserMedia()` API
- Prefers the rear camera on mobile devices (`facingMode: 'environment'`)
- Handles permission denials gracefully with user-friendly error messages

### Photo Capture
- Captures photos using a hidden canvas element
- Converts the canvas to a Blob with JPEG compression (quality: 0.8)
- Creates a File object with a timestamp-based filename
- Validates file size and type before calling the onCapture callback

### Error Handling
- Permission denied errors
- Camera not available errors
- File size validation errors
- File type validation errors

## Usage Examples

### Basic Usage
```tsx
import { CameraCapture } from '@/components/ui/camera'

function MyComponent() {
  const handleCapture = (file: File) => {
    // Handle the captured file
    console.log('Captured file:', file)
  }

  return (
    <CameraCapture onCapture={handleCapture} />
  )
}
```

### With Custom Validation
```tsx
import { CameraCapture } from '@/components/ui/camera'

function MyComponent() {
  const handleCapture = (file: File) => {
    // Handle the captured file
    console.log('Captured file:', file)
  }

  const handleError = (error: string) => {
    // Handle camera errors
    console.error('Camera error:', error)
  }

  return (
    <CameraCapture 
      onCapture={handleCapture}
      onCameraError={handleError}
      maxFileSize={2 * 1024 * 1024} // 2MB limit
      allowedTypes={['image/jpeg', 'image/png']} // JPEG and PNG only
    />
  )
}
```

## Integration with Existing Forms

### Product Forms
Both product forms now offer two options for image upload:
1. Traditional file selection
2. Camera capture

The UI shows both options side-by-side for easy access.

### Ticket Form
The ticket form allows capturing multiple photos for device documentation, with the same dual approach:
1. Traditional file selection
2. Camera capture

## Testing
A test page has been created at `/camera-test` to verify the camera functionality.

## Browser Support
This feature requires browsers that support:
- `navigator.mediaDevices.getUserMedia()`
- Canvas API
- File API

Most modern browsers support these features, including:
- Chrome 53+
- Firefox 36+
- Safari 11+
- Edge 79+

## Security Considerations
- Camera access requires HTTPS in production
- Users must explicitly grant camera permissions
- No photos are stored or transmitted without user action
- File validation prevents malicious file uploads

## Performance
- Photos are captured at the camera's native resolution
- JPEG compression reduces file size
- Camera stream is properly cleaned up when not in use
- Object URLs for previews are revoked to prevent memory leaks