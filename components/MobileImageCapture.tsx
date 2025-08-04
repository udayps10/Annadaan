'use client'

import { useState } from 'react'
import { compressForPickup, validateImageFile } from '../lib/imageCompression'

interface MobileImageCaptureProps {
  onImageCapture: (file: File) => void
  onError: (error: string) => void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

export function MobileImageCapture({ 
  onImageCapture, 
  onError, 
  disabled = false,
  className = '',
  children 
}: MobileImageCaptureProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsProcessing(true)

      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        onError(validation.error!)
        return
      }

      // Compress the image
      const compressedFile = await compressForPickup(file)
      
      // Call the callback with compressed file
      onImageCapture(compressedFile)
      
    } catch (error) {
      console.error('Image processing error:', error)
      onError('Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
      // Reset input so the same file can be selected again
      e.target.value = ''
    }
  }

  return (
    <div className={className}>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        capture="environment" // Use rear camera by default
        onChange={handleCapture}
        disabled={disabled || isProcessing}
        className="hidden"
        id="mobile-camera-input"
      />
      
      <label 
        htmlFor="mobile-camera-input"
        className={`${
          disabled || isProcessing 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:opacity-80'
        } transition-opacity block`}
      >
        {isProcessing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Processing image...</span>
          </div>
        ) : (
          children || (
            <div className="flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Take Photo</span>
            </div>
          )
        )}
      </label>
    </div>
  )
}
