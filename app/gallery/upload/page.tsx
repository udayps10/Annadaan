'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAlert } from '../../../hooks/useAlert'
import { AlertModal } from '../../../components/AlertModal'
import { ImageUpload } from '../../../components/ImageUpload'
import { compressForGallery } from '../../../lib/imageCompression'

export default function GalleryUploadPage() {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useAlert()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    peopleHelped: '',
    tags: [] as string[],
    newTag: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login?redirect=/gallery/upload')
      return
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      setUser(payload)
    } catch (error) {
      console.error('Failed to decode token')
      router.push('/login')
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (file: File, preview: string) => {
    setSelectedFile(file)
    setPreviewImage(preview)
  }

  const handleImageError = (error: string) => {
    showError(error)
  }

  const addTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile) {
      showWarning('Please select a photo to upload')
      return
    }

    if (!formData.title || !formData.description) {
      showWarning('Please fill in the title and description')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')

      // First, upload the photo
      const fileData = new FormData()
      fileData.append('photo', selectedFile)

      const uploadResponse = await fetch('/api/upload-gallery-photo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: fileData
      })

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json()
        throw new Error(uploadError.message || 'Failed to upload photo')
      }

      const uploadResult = await uploadResponse.json()

      // Then, save the gallery entry
      const galleryResponse = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          peopleHelped: parseInt(formData.peopleHelped) || 0,
          tags: formData.tags,
          photoUrl: uploadResult.url,
          photoFilename: uploadResult.filename
        })
      })

      if (!galleryResponse.ok) {
        const galleryError = await galleryResponse.json()
        throw new Error(galleryError.message || 'Failed to save gallery entry')
      }

      showSuccess('Your impact story has been shared successfully! It will be visible after admin approval.')
      router.push('/gallery')
    } catch (error: any) {
      showError('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const suggestedTags = [
    'Community Lunch', 'Homeless Shelter', 'Children Feeding', 'Elderly Care',
    'School Program', 'Emergency Relief', 'Food Distribution', 'Holiday Meal',
    'Soup Kitchen', 'Senior Center', 'Youth Program', 'Family Support'
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                🍽️ FoodRescue
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/gallery" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Gallery
              </Link>
              <Link 
                href={`/dashboard/${user?.role || 'vendor'}`} 
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Share Your Impact Story
          </h1>
          <p className="text-lg text-gray-600">
            Show the community how your food sharing is making a difference. Your story inspires others to join the cause!
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                📸 Upload Photo *
              </label>
              
              {previewImage ? (
                <div className="space-y-4">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="mx-auto max-h-64 rounded-lg object-cover border-2 border-gray-200"
                  />
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null)
                        setSelectedFile(null)
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <ImageUpload
                  onImageSelect={handleImageSelect}
                  onError={handleImageError}
                  compressionOptions={{
                    maxSizeMB: 2,
                    maxWidthOrHeight: 2048,
                    quality: 0.85
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors"
                >
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload a photo showing food being shared with people in need
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 50MB (will be compressed to 2MB)</p>
                  </div>
                </ImageUpload>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
                📝 Story Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Feeding 50 families at local shelter"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                📖 Story Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell us about this moment - what food was shared, who was helped, what impact it made..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-900 mb-2">
                📍 Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Community Center, City Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* People Helped */}
            <div>
              <label htmlFor="peopleHelped" className="block text-sm font-medium text-gray-900 mb-2">
                👥 Number of People Helped
              </label>
              <input
                type="number"
                id="peopleHelped"
                name="peopleHelped"
                value={formData.peopleHelped}
                onChange={handleInputChange}
                min="0"
                placeholder="Approximate number of people who benefited"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                🏷️ Tags
              </label>
              
              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="inline-flex items-center bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Tag */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  name="newTag"
                  value={formData.newTag}
                  onChange={handleInputChange}
                  placeholder="Add a tag..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Suggested Tags */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter(tag => !formData.tags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Link
                href="/gallery"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sharing Your Story...' : 'Share Impact Story'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-blue-900 mb-2">📋 Guidelines for Impact Photos</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Show food being distributed or people enjoying meals</li>
            <li>• Ensure photos respect the dignity and privacy of recipients</li>
            <li>• Include context that shows the positive impact</li>
            <li>• Photos will be reviewed before being published</li>
            <li>• Only share photos you have permission to use</li>
          </ul>
        </div>
      </div>
      
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
    </div>
  )
}
