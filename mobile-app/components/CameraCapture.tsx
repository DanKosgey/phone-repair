import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
// Note: We use CameraView instead of the legacy Camera
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

// Fallbacks in case your theme constants aren't available during this copy-paste
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  // 1. Use the modernized permission hook
  const [permission, requestPermission] = useCameraPermissions();
  
  // 2. Use string literals instead of enums to avoid "undefined" errors
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  
  const [zoom, setZoom] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const flashAnimation = useRef(new Animated.Value(0)).current;
  const captureButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
    StatusBar.setHidden(true);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const takePicture = async () => {
    console.log('[CAMERA_CAPTURE] Taking picture');
    
    if (!cameraRef.current || isCapturing || !isReady) {
      console.warn('[CAMERA_CAPTURE] Camera not ready or already capturing');
      return;
    }

    setIsCapturing(true);

    // Animations
    Animated.parallel([
      Animated.sequence([
        Animated.timing(captureButtonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(captureButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.timing(flashAnimation, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(flashAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
      ])
    ]).start();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        exif: true,
      });

      if (photo?.uri) {
        console.log('[CAMERA_CAPTURE] Picture taken successfully', { uri: photo.uri });
        onCapture(photo.uri);
      } else {
        console.warn('[CAMERA_CAPTURE] No URI returned from camera');
      }
    } catch (error) {
      console.error('[CAMERA_CAPTURE] Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo.');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickImageFromGallery = async () => {
    console.log('[CAMERA_CAPTURE] Picking image from gallery');
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      console.warn('[CAMERA_CAPTURE] Gallery permission denied');
      Alert.alert('Permission Required', 'Access to gallery is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      console.log('[CAMERA_CAPTURE] Image picked from gallery', { uri: result.assets[0].uri });
      onCapture(result.assets[0].uri);
    } else {
      console.log('[CAMERA_CAPTURE] Gallery image selection cancelled or failed');
    }
  };

  const toggleFlash = () => {
    const newFlash = flash === 'off' ? 'on' : flash === 'on' ? 'auto' : 'off';
    console.log('[CAMERA_CAPTURE] Flash toggled', { from: flash, to: newFlash });
    setFlash(newFlash);
  };

  const getFlashIcon = () => {
    if (flash === 'on') return 'flash';
    if (flash === 'auto') return 'flash-outline';
    return 'flash-off';
  };

  // Permission UI logic
  if (!permission) return <View style={styles.container} />; // Loading

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors?.light?.error || 'red'} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancel} style={{ marginTop: 20 }}>
          <Text style={{ color: 'gray' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[styles.flashOverlay, { opacity: flashAnimation }]} 
        pointerEvents="none" 
      />

      <CameraView
        style={styles.camera}
        facing={facing}
        flash={flash}
        zoom={zoom}
        ref={cameraRef}
        onCameraReady={() => setIsReady(true)}
      />

      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity style={styles.topButton} onPress={() => {
          console.log('[CAMERA_CAPTURE] Camera cancelled');
          onCancel();
        }}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.topButton} onPress={toggleFlash}>
          <Ionicons name={getFlashIcon()} size={28} color={flash !== 'off' ? '#FFD700' : 'white'} />
        </TouchableOpacity>
      </View>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity onPress={() => {
          const newZoom = Math.min(zoom + 0.1, 1);
          console.log('[CAMERA_CAPTURE] Zoom increased', { from: zoom, to: newZoom });
          setZoom(newZoom);
        }} style={styles.zoomButton}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.zoomText}>{(zoom * 10 + 1).toFixed(1)}x</Text>
        <TouchableOpacity onPress={() => {
          const newZoom = Math.max(zoom - 0.1, 0);
          console.log('[CAMERA_CAPTURE] Zoom decreased', { from: zoom, to: newZoom });
          setZoom(newZoom);
        }} style={styles.zoomButton}>
          <Ionicons name="remove" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImageFromGallery}>
          <Ionicons name="images" size={30} color="white" />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: captureButtonScale }] }}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={isCapturing || !isReady}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity 
          style={styles.galleryButton} 
          onPress={() => {
            const newFacing = facing === 'back' ? 'front' : 'back';
            console.log('[CAMERA_CAPTURE] Camera facing toggled', { from: facing, to: newFacing });
            setFacing(newFacing);
          }}
        >
          <Ionicons name="camera-reverse" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  camera: { flex: 1 },
  flashOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'white', zIndex: 10 },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  topButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomControls: {
    position: 'absolute',
    right: 20,
    top: height / 2 - 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    zIndex: 20,
  },
  zoomButton: { padding: 10 },
  zoomText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
  },
  galleryButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15 },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: { color: 'white', fontWeight: '600' },
});