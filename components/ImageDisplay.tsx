import { useState } from 'react';

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageDisplay({ src, alt, className = '' }: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if it's a data URL (base64)
  const isDataUrl = src.startsWith('data:');
  
  // For old file paths, try to fetch from the uploads directory first
  // If that fails, show a placeholder or error message
  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (imageError) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500 p-4">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-sm">Image not available</div>
          <div className="text-xs mt-1">
            {isDataUrl ? 'Invalid image data' : 'File not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`bg-gray-100 border border-gray-300 rounded flex items-center justify-center absolute inset-0 ${className}`}>
          <div className="text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mx-auto"></div>
            <div className="text-xs mt-2">Loading image...</div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
}
