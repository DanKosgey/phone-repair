import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '../constants/theme';

interface CameraCaptureProps {
  onCapture: (uri: string) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<any>('back');
  const [flashMode, setFlashMode] = useState<any>('off');
  const cameraRef = useRef<any>(null);

  // Request camera permission
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        onCapture(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to capture photo. Please try again.');
      }
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === 'back' ? 'front' : 'back'
    );
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === 'off' ? 'on' : 'off'
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required to take photos</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={onCancel}
        >
          <Text style={styles.permissionButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera} 
        type={cameraType}
        flashMode={flashMode}
        ref={cameraRef}
      >
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={onCancel}>
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse" size={32} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Ionicons 
              name={flashMode === 'on' ? "flash" : "flash-off"} 
              size={32} 
              color={flashMode === 'on' ? "yellow" : "white"} 
            />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    width: width,
    height: height,
  },
  controlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: Spacing.xxl,
  },
  controlButton: {
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BorderRadius.full,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light.background,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    color: Colors.light.text,
  },
  permissionButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: {
    color: Colors.light.background,
    fontWeight: '600',
    fontSize: 16,
  },
});