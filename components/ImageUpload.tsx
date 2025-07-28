'use client'

import { useState, useRef } from 'react'
import { compressImage, validateImageFile, createImagePreview, CompressionOptions } from '../lib/imageCompression'

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void
  onError?: (error: string) => void
  compressionOptions?: CompressionOptions
  className?: string
  accept?: string
  children?: React.ReactNode
  disabled?: boolean
}

export function ImageUpload({ 
  onImageSelect, 
  onError, 
  compressionOptions,
  className = '',
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  children,
  disabled = false
}: ImageUploadProps) {
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsCompressing(true)

      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        onError?.(validation.error!)
        return
      }

      // Compress image
      const compressedFile = await compressImage(file, compressionOptions)
      
      // Create preview
      const preview = await createImagePreview(compressedFile)
      
      // Call the callback with compressed file and preview
      onImageSelect(compressedFile, preview)
      
    } catch (error) {
      console.error('Image processing error:', error)
      onError?.('Failed to process image. Please try again.')
    } finally {
      setIsCompressing(false)
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const triggerFileSelect = () => {
    if (!disabled && !isCompressing) {
      fileInputRef.current?.click()
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isCompressing}
      />
      
      <div 
        onClick={triggerFileSelect}
        className={`${className} ${
          disabled || isCompressing 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:opacity-80'
        } transition-opacity`}
      >
        {isCompressing ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Compressing image...</span>
          </div>
        ) : (
          children || (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 50MB (will be compressed)</p>
              </div>
            </div>
          )
        )}
      </div>
    </>
  )
}
