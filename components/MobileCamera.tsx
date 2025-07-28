'use client'

import React, { useState } from 'react';

interface MobileCameraProps {
  onImageSelected: (imageData: string) => void;
  className?: string;
}

const MobileCamera: React.FC<MobileCameraProps> = ({ onImageSelected, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const takePicture = async () => {
    // Use file input for photo selection
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Prefer rear camera on mobile
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          onImageSelected(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <button
      onClick={takePicture}
      disabled={isLoading}
      className={`flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <>
          <span className="mr-2">📷</span>
          Choose Photo
        </>
      )}
    </button>
  );
};

export default MobileCamera;
