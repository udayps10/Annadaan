'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import ImageDisplay from '@/components/ImageDisplay'
import { useAlert } from '../../../hooks/useAlert'
import { AlertModal } from '../../../components/AlertModal'
import { usePrompt } from '../../../hooks/usePrompt'
import { PromptModal } from '../../../components/PromptModal'

interface FoodListing {
  id: number
  title: string
  description: string
  food_type: string
  quantity: string
  expiry_date: string
  pickup_location: string
  contact_info: string
  vendor_name: string
  status: string
}

interface PickupRequest {
  id: number
  listing_id: number
  message: string
  requested_pickup_time: string
  status: string
  vendor_response: string
  listing_title: string
  vendor_name: string
  pickup_photo_url: string
  pickup_photo_filename: string
  pickup_notes: string
}

export default function NGODashboard() {
  const { alertState, showSuccess, showError, showWarning, hideAlert } = useAlert()
  const { promptState, showPrompt, handleConfirm, handleCancel } = usePrompt()
  const [foodListings, setFoodListings] = useState<FoodListing[]>([])
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [newDataAvailable, setNewDataAvailable] = useState(false)
  const [lastListingCount, setLastListingCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Decode token to get user info (simple decode, in production use proper JWT decode)
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]))
      if (tokenData.role !== 'ngo') {
        router.push('/login')
        return
      }
      // Get user name from localStorage (stored during login)
      const userName = localStorage.getItem('userName') || 'User'
      setUser({ name: userName, role: tokenData.role, userId: tokenData.userId })
    } catch (error) {
      router.push('/login')
      return
    }

    fetchData()
    
    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchData()
      }, 30000) // Refresh every 30 seconds
      setRefreshInterval(interval)
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [router, autoRefresh])

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch available food listings (API now shows only available listings for NGOs)
      const listingsResponse = await fetch('/api/listings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json()
        const newListings = listingsData.listings || []
        
        // Check if there are new listings
        if (newListings.length > lastListingCount && lastListingCount > 0) {
          setNewDataAvailable(true)
          setTimeout(() => setNewDataAvailable(false), 3000)
        }
        
        setFoodListings(newListings)
        setLastListingCount(newListings.length)
      }

      // Fetch my pickup requests (API now filters to show only this NGO's requests)
      const requestsResponse = await fetch('/api/pickup-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setPickupRequests(requestsData.requests || [])
      }
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [lastListingCount])

  const handleRefresh = () => {
    setLoading(true)
    fetchData()
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    if (!autoRefresh) {
      const interval = setInterval(() => {
        fetchData()
      }, 30000)
      setRefreshInterval(interval)
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
    }
  }

  const requestPickup = async (listingId: number) => {
    try {
      const token = localStorage.getItem('token')
      
      // Get message from user using modal
      const message = await showPrompt(
        'Send Pickup Request',
        'Enter a message for the vendor (optional):',
        { placeholder: 'Optional message for the vendor...' }
      )
      
      if (message === null) return // User cancelled
      
      // Get pickup time from user using modal
      const pickupTime = await showPrompt(
        'Preferred Pickup Time',
        'Preferred pickup time:',
        { 
          placeholder: 'YYYY-MM-DD HH:MM',
          type: 'datetime-local'
        }
      )
      
      if (pickupTime === null) return // User cancelled

      const response = await fetch('/api/pickup-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: listingId,
          message,
          requested_pickup_time: pickupTime
        })
      })

      if (response.ok) {
        showSuccess('Pickup request sent successfully!')
        fetchData() // Refresh data
      } else {
        const data = await response.json()
        showError(data.message || 'Failed to send pickup request')
      }
    } catch (error) {
      showError('Error sending pickup request')
    }
  }

  const markAsPickedUp = async (requestId: number) => {
    try {
      // Create a file input element
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.accept = 'image/jpeg,image/jpg,image/png,image/webp'
      fileInput.required = true

      fileInput.onchange = async (e: any) => {
        const file = e.target.files[0]
        if (!file) {
          showWarning('Please select a photo to upload')
          return
        }

        try {
          setUploadingPhoto(requestId)

          // Upload the photo first
          const formData = new FormData()
          formData.append('photo', file)

          const token = localStorage.getItem('token')
          const uploadResponse = await fetch('/api/upload-photo', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          })

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json()
            throw new Error(uploadError.message || 'Failed to upload photo')
          }

          const uploadResult = await uploadResponse.json()

          // Get pickup notes from user using modal
          const notes = await showPrompt(
            'Pickup Notes',
            'Add any notes about the pickup (optional):',
            { placeholder: 'Optional notes about the pickup...' }
          )
          
          if (notes === null) {
            setUploadingPhoto(null)
            return // User cancelled
          }

          // Mark pickup as completed with photo
          const response = await fetch(`/api/pickup-requests/${requestId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              status: 'completed',
              pickup_photo_url: uploadResult.url,
              pickup_photo_filename: uploadResult.filename,
              pickup_notes: notes
            })
          })

          if (response.ok) {
            showSuccess('Pickup marked as completed successfully with photo verification!')
            fetchData() // Refresh data
          } else {
            const data = await response.json()
            showError(data.message || 'Failed to update pickup status')
          }
        } catch (error: any) {
          showError('Error: ' + error.message)
        } finally {
          setUploadingPhoto(null)
        }
      }

      // Trigger file selection
      fileInput.click()
    } catch (error) {
      showError('Error opening file selector')
      setUploadingPhoto(null)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* New Data Notification */}
      {newDataAvailable && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-right">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">🍽️ New food available!</span>
            <button 
              onClick={() => setNewDataAvailable(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">NGO Dashboard</h1>
              {user && (
                <span className="ml-4 text-gray-600">Welcome, {user.name}</span>
              )}
              {loading && (
                <div className="ml-4 flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                  Updating...
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
              <a
                href="/gallery"
                className="text-primary-600 hover:text-primary-800 px-3 py-1 rounded-md text-sm font-medium transition-colors"
              >
                📸 Gallery
              </a>
              <button
                onClick={toggleAutoRefresh}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Food Listings */}
          <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Available Food Listings</h2>
              <div className="flex items-center space-x-2">
                {autoRefresh && (
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    Live
                  </div>
                )}
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {foodListings.length} items
                </span>
              </div>
            </div>
            
            {foodListings.length === 0 ? (
              <p className="text-gray-600">No food listings available at the moment.</p>
            ) : (
              <div className="space-y-4">
                {foodListings.map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'available' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                      <div><strong>Type:</strong> {listing.food_type}</div>
                      <div><strong>Quantity:</strong> {listing.quantity}</div>
                      <div><strong>Expires:</strong> {new Date(listing.expiry_date).toLocaleDateString()}</div>
                      <div><strong>Vendor:</strong> {listing.vendor_name}</div>
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      <strong>Pickup Location:</strong> {listing.pickup_location}
                    </div>
                    {listing.status === 'available' && (
                      <button
                        onClick={() => requestPickup(listing.id)}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
                      >
                        Request Pickup
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Pickup Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">My Pickup Requests</h2>
            
            {pickupRequests.length === 0 ? (
              <p className="text-gray-600">You haven't made any pickup requests yet.</p>
            ) : (
              <div className="space-y-4">
                {pickupRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{request.listing_title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      <strong>Vendor:</strong> {request.vendor_name}
                    </div>
                    {request.message && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Your Message:</strong> {request.message}
                      </div>
                    )}
                    {request.requested_pickup_time && (
                      <div className="text-sm text-gray-500 mb-2">
                        <strong>Requested Time:</strong> {new Date(request.requested_pickup_time).toLocaleString()}
                      </div>
                    )}
                    {request.vendor_response && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-2">
                        <strong>Vendor Response:</strong> {request.vendor_response}
                      </div>
                    )}
                    {request.pickup_photo_url && (
                      <div className="mb-2">
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Pickup Photo:</strong>
                        </div>
                        <ImageDisplay
                          src={request.pickup_photo_url}
                          alt="Pickup verification photo"
                          className="max-w-full h-32 object-cover rounded border"
                        />
                        {request.pickup_notes && (
                          <div className="text-sm text-gray-500 mt-1">
                            <strong>Notes:</strong> {request.pickup_notes}
                          </div>
                        )}
                      </div>
                    )}
                    {request.status === 'approved' && (
                      <button
                        onClick={() => markAsPickedUp(request.id)}
                        disabled={uploadingPhoto === request.id}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingPhoto === request.id ? 'Uploading Photo...' : '📸 Upload Photo & Mark Picked Up'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />
      
      <PromptModal
        isOpen={promptState.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={promptState.title}
        message={promptState.message}
        placeholder={promptState.placeholder}
        defaultValue={promptState.defaultValue}
        type={promptState.type}
      />
    </div>
  )
}