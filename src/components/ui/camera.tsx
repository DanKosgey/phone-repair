"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Camera as CameraIcon, Upload, X } from "lucide-react"

interface CameraProps {
  onCapture: (file: File) => void
  onCameraError?: (error: string) => void
  maxFileSize?: number // in bytes
  allowedTypes?: string[]
}

// Renamed component from Camera to CameraCapture to avoid naming conflict
export function CameraCapture({ 
  onCapture, 
  onCameraError,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
}: CameraProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer rear camera on mobile
      })
      setStream(mediaStream)
      setIsCameraActive(true)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error)
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Camera access denied. Please allow camera permissions.' 
        : 'Unable to access camera. Please check your device settings.'
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      if (onCameraError) {
        onCameraError(errorMessage)
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    
    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        // Validate file size
        if (blob.size > maxFileSize) {
          toast({
            title: "File Too Large",
            description: `Image size must be less than ${maxFileSize / (1024 * 1024)}MB`,
            variant: "destructive",
          })
          return
        }
        
        // Validate file type
        if (!allowedTypes.includes(blob.type)) {
          toast({
            title: "Invalid File Type",
            description: "Please capture a valid image file (JPEG, PNG, or WebP)",
            variant: "destructive",
          })
          return
        }
        
        // Create file with timestamp name
        const timestamp = new Date().getTime()
        const extension = blob.type.split('/')[1] || 'jpg'
        const fileName = `camera-${timestamp}.${extension}`
        const file = new File([blob], fileName, { type: blob.type })
        
        onCapture(file)
        stopCamera()
      }
    }, 'image/jpeg', 0.8) // JPEG quality
  }

  return (
    <div className="flex flex-col gap-4">
      {isCameraActive ? (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto max-h-96 rounded-lg border"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute top-4 left-4">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full w-10 h-10 border-2 border-white bg-black bg-opacity-50 hover:bg-opacity-75"
              onClick={stopCamera}
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
          <div className="absolute top-4 right-4">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full w-10 h-10 border-2 border-white bg-black bg-opacity-50 hover:bg-opacity-75"
              onClick={stopCamera}
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button
              type="button"
              variant="default"
              size="icon"
              className="rounded-full w-16 h-16 border-4 border-white bg-white hover:bg-gray-100"
              onClick={capturePhoto}
            >
              <div className="w-10 h-10 rounded-full bg-red-500"></div>
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="flex flex-col items-center gap-1 h-auto py-2 w-full"
          onClick={startCamera}
        >
          <CameraIcon className="h-4 w-4" />
          <span className="text-xs">Camera</span>
        </Button>
      )}
    </div>
  )
}