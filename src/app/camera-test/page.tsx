'use client'

import { useState } from 'react'
import { CameraCapture } from '@/components/ui/camera'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function CameraTestPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleCapture = (file: File) => {
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setCapturedImage(null)
    setFileName(null)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Camera Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Camera Component</h2>
          <CameraCapture onCapture={handleCapture} />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Captured Image</h2>
          {capturedImage ? (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="max-w-full h-auto rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 rounded-full"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {fileName && (
                <p className="text-sm text-muted-foreground">
                  File: {fileName}
                </p>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed rounded-lg w-full h-64 flex items-center justify-center">
              <p className="text-muted-foreground">No image captured yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}