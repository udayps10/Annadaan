'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageDisplay from '@/components/ImageDisplay'
import { ImpactPhoto } from '@/types/gallery'

export default function GalleryPage() {
  const [photos, setPhotos] = useState<ImpactPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<ImpactPhoto | null>(null)
  const [filterTag, setFilterTag] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch (error) {
        console.error('Failed to decode token')
      }
    }

    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gallery')
      
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos || [])
      } else {
        console.error('Failed to fetch gallery photos')
      }
    } catch (error) {
      console.error('Error fetching gallery photos:', error)
    } finally {
      setLoading(false)
    }
  }

  const allTags = Array.from(new Set(
    photos.flatMap(photo => {
      try {
        return photo.tags ? JSON.parse(photo.tags as any) : []
      } catch {
        return []
      }
    })
  ))

  const filteredPhotos = filterTag 
    ? photos.filter(photo => {
        try {
          const tags = photo.tags ? JSON.parse(photo.tags as any) : []
          return tags.includes(filterTag)
        } catch {
          return false
        }
      })
    : photos

  const openModal = (photo: ImpactPhoto) => {
    setSelectedPhoto(photo)
  }

  const closeModal = () => {
    setSelectedPhoto(null)
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPhotoTags = (photo: ImpactPhoto) => {
    try {
      return photo.tags ? JSON.parse(photo.tags as any) : []
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading community gallery...</div>
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
                🍽️ Annadaan
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                Home
              </Link>
              {isLoggedIn ? (
                <>
                  <Link 
                    href={`/dashboard/${user?.role || 'vendor'}`} 
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/gallery/upload" 
                    className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Share Impact
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                    Login
                  </Link>
                  <Link href="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                    Join Us
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Community Impact Gallery
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See the beautiful moments when good food reaches people in need. Every image tells a story of community care and sharing.
          </p>
          
          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-primary-600">{photos.length}</div>
              <div className="text-sm text-gray-600">Stories Shared</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {photos.reduce((sum, photo) => sum + (photo.peopleHelped || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">People Helped</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{allTags.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>

        {/* Filter Tags */}
        {allTags.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setFilterTag('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterTag === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterTag === tag 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action for Logged-in Users */}
        {isLoggedIn && (
          <div className="mb-8 text-center">
            <Link 
              href="/gallery/upload"
              className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
            >
              📸 Share Your Impact Story
            </Link>
          </div>
        )}

        {/* Gallery Grid */}
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No stories yet</h3>
            <p className="text-gray-600 mb-6">
              {filterTag ? `No stories found for "${filterTag}"` : 'Be the first to share your impact story!'}
            </p>
            {isLoggedIn && (
              <Link 
                href="/gallery/upload"
                className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Share Your Story
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPhotos.map((photo) => (
              <div 
                key={photo.id} 
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                onClick={() => openModal(photo)}
              >
                <div className="aspect-[4/3] overflow-hidden rounded-t-xl bg-gray-100">
                  <ImageDisplay
                    src={photo.photoUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{photo.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{photo.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>📍 {photo.location || 'Unknown location'}</span>
                    {photo.peopleHelped && photo.peopleHelped > 0 && (
                      <span>👥 {photo.peopleHelped} helped</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      by {photo.organizationName || photo.userFullName}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(photo.dateShared)}
                    </div>
                  </div>

                  {/* Tags */}
                  {getPhotoTags(photo).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getPhotoTags(photo).slice(0, 2).map((tag: string) => (
                        <span 
                          key={tag}
                          className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {getPhotoTags(photo).length > 2 && (
                        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          +{getPhotoTags(photo).length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Full Photo View */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-screen overflow-y-auto shadow-2xl">
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-opacity"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="relative w-full bg-gray-100 flex items-center justify-center rounded-t-xl" style={{ height: '500px' }}>
                <ImageDisplay
                  src={selectedPhoto.photoUrl}
                  alt={selectedPhoto.title}
                  className="object-contain"
                  style={{ maxHeight: '500px', maxWidth: '100%', height: 'auto', width: 'auto' }}
                />
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedPhoto.title}</h2>
                <p className="text-gray-700 mb-4">{selectedPhoto.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">📍 Location</div>
                    <div className="text-sm text-gray-600">{selectedPhoto.location || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">👥 People Helped</div>
                    <div className="text-sm text-gray-600">{selectedPhoto.peopleHelped || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">🏢 Organization</div>
                    <div className="text-sm text-gray-600">{selectedPhoto.organizationName || selectedPhoto.userFullName}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">📅 Date</div>
                    <div className="text-sm text-gray-600">{formatDate(selectedPhoto.dateShared)}</div>
                  </div>
                </div>

                {/* Tags */}
                {getPhotoTags(selectedPhoto).length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">🏷️ Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {getPhotoTags(selectedPhoto).map((tag: string) => (
                        <span 
                          key={tag}
                          className="inline-block bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
