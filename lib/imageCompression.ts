import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
  quality?: number
}

export const compressImage = async (
  file: File, 
  options: CompressionOptions = {}
): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920, // Max width or height
    useWebWorker: true, // Use web worker for better performance
    fileType: file.type, // Preserve original file type
    quality: 0.6, // Quality from 0 to 1
    ...options
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions)
    
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    // Return original file if compression fails
    return file
  }
}

// Specific compression presets for different use cases
export const compressForGallery = (file: File): Promise<File> => {
  return compressImage(file, {
    maxSizeMB: 2, // Larger size for gallery photos
    maxWidthOrHeight: 2048,
    quality: 0.85
  })
}

export const compressForProfile = (file: File): Promise<File> => {
  return compressImage(file, {
    maxSizeMB: 0.5, // Smaller size for profile photos
    maxWidthOrHeight: 800,
    quality: 0.8
  })
}

export const compressForPickup = (file: File): Promise<File> => {
  return compressImage(file, {
    maxSizeMB: 1, // Medium size for pickup verification photos
    maxWidthOrHeight: 1280,
    quality: 0.8
  })
}

// Validate image file before compression
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
    }
  }
  
  // Check if file is too large (before compression)
  const maxSizeBeforeCompression = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSizeBeforeCompression) {
    return {
      valid: false,
      error: 'File too large. Maximum size before compression is 50MB.'
    }
  }
  
  return { valid: true }
}

// Preview image before upload
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('Failed to create preview'))
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
