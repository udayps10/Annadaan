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
  status: string
  created_at: string
}

interface PickupRequest {
  id: number
  listing_id: number
  message: string
  requested_pickup_time: string
  status: string
  vendor_response: string
  listing_title: string
  ngo_name: string
  ngo_email: string
  pickup_photo_url: string
  pickup_photo_filename: string
  pickup_notes: string
}

export default function VendorDashboard() {
  const { alertState, showSuccess, showError, hideAlert } = useAlert()
  const { promptState, showPrompt, handleConfirm, handleCancel } = usePrompt()
  const [myListings, setMyListings] = useState<FoodListing[]>([])
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [newDataAvailable, setNewDataAvailable] = useState(false)
  const [lastRequestCount, setLastRequestCount] = useState(0)
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    food_type: '',
    quantity: '',
    expiry_date: '',
    pickup_location: '',
    contact_info: ''
  })
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
      if (tokenData.role !== 'vendor') {
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
      if (!token) return
      
      // Fetch my listings (API now filters by vendor automatically)
      const listingsResponse = await fetch('/api/listings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json()
        setMyListings(listingsData.listings || [])
      }

      // Fetch pickup requests for my listings (API now filters by vendor automatically)
      const requestsResponse = await fetch('/api/pickup-requests', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        const newRequests = requestsData.requests || []
        
        // Check if there are new requests
        if (newRequests.length > lastRequestCount && lastRequestCount > 0) {
          setNewDataAvailable(true)
          setTimeout(() => setNewDataAvailable(false), 3000)
        }
        
        setPickupRequests(newRequests)
        setLastRequestCount(newRequests.length)
      }
      
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [lastRequestCount])

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

  const handleAddListing = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newListing)
      })

      if (response.ok) {
        showSuccess('Food listing added successfully!')
        setNewListing({
          title: '',
          description: '',
          food_type: '',
          quantity: '',
          expiry_date: '',
          pickup_location: '',
          contact_info: ''
        })
        setShowAddForm(false)
        fetchData() // Refresh data
      } else {
        const data = await response.json()
        showError(data.message || 'Failed to add listing')
      }
    } catch (error) {
      showError('Error adding listing')
    }
  }

  const handleRequestResponse = async (requestId: number, status: 'approved' | 'rejected', response: string) => {
    try {
      const token = localStorage.getItem('token')
      const apiResponse = await fetch(`/api/pickup-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          vendor_response: response
        })
      })

      if (apiResponse.ok) {
        showSuccess(`Request ${status} successfully!`)
        fetchData() // Refresh data
      } else {
        const data = await apiResponse.json()
        showError(data.message || 'Failed to update request')
      }
    } catch (error) {
      showError('Error updating request')
    }
  }

  const updateListingStatus = async (listingId: number, status: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        showSuccess('Listing status updated successfully!')
        fetchData() // Refresh data
      } else {
        const data = await response.json()
        showError(data.message || 'Failed to update listing')
      }
    } catch (error) {
      showError('Error updating listing')
    }
  }

  const handleApproveRequest = async (requestId: number) => {
    const response = await showPrompt(
      'Approve Request',
      'Enter response message (optional):',
      { placeholder: 'Optional message for the NGO...' }
    )
    
    if (response !== null) {
      handleRequestResponse(requestId, 'approved', response)
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    const reason = await showPrompt(
      'Reject Request',
      'Enter rejection reason (optional):',
      { placeholder: 'Optional reason for rejection...' }
    )
    
    if (reason !== null) {
      handleRequestResponse(requestId, 'rejected', reason)
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
    <div className="min-h-screen bg-gray-50 relative">
      {/* New Data Notification */}
      {newDataAvailable && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-right">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">📋 New pickup request!</span>
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
              <h1 className="text-xl font-bold text-gray-900">Vendor Dashboard</h1>
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
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
              >
                {showAddForm ? 'Cancel' : 'Add Food Listing'}
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
        {/* Add New Listing Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Food Listing</h2>
            <form onSubmit={handleAddListing} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
                <input
                  type="text"
                  value={newListing.food_type}
                  onChange={(e) => setNewListing({...newListing, food_type: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="text"
                  value={newListing.quantity}
                  onChange={(e) => setNewListing({...newListing, quantity: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newListing.expiry_date}
                  onChange={(e) => setNewListing({...newListing, expiry_date: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                <input
                  type="text"
                  value={newListing.pickup_location}
                  onChange={(e) => setNewListing({...newListing, pickup_location: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                <input
                  type="text"
                  value={newListing.contact_info}
                  onChange={(e) => setNewListing({...newListing, contact_info: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
                >
                  Add Listing
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Food Listings */}
          <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">My Food Listings</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {myListings.length} items
              </span>
            </div>
            
            {myListings.length === 0 ? (
              <p className="text-gray-600">You haven't created any food listings yet.</p>
            ) : (
              <div className="space-y-4">
                {myListings.map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        listing.status === 'available' ? 'bg-green-100 text-green-800' :
                        listing.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                        listing.status === 'picked_up' ? 'bg-blue-100 text-blue-800' :
                        listing.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {listing.status === 'picked_up' ? 'Completed' : listing.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                      <div><strong>Type:</strong> {listing.food_type}</div>
                      <div><strong>Quantity:</strong> {listing.quantity}</div>
                      <div><strong>Expires:</strong> {new Date(listing.expiry_date).toLocaleDateString()}</div>
                      <div><strong>Location:</strong> {listing.pickup_location}</div>
                    </div>
                    {/* Only show action buttons if the listing hasn't been picked up */}
                    {listing.status !== 'picked_up' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateListingStatus(listing.id, 'available')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                          disabled={listing.status === 'available'}
                        >
                          Mark Available
                        </button>
                        <button
                          onClick={() => updateListingStatus(listing.id, 'expired')}
                          className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                          disabled={listing.status === 'expired'}
                        >
                          Mark Expired
                        </button>
                      </div>
                    )}
                    {/* Show completion message for picked up items */}
                    {listing.status === 'picked_up' && (
                      <div className="text-sm text-blue-600 font-medium">
                        ✅ This order has been completed and delivered
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pickup Requests */}
          <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Pickup Requests</h2>
              <div className="flex items-center space-x-2">
                {autoRefresh && (
                  <div className="flex items-center text-sm text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    Live
                  </div>
                )}
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {pickupRequests.length} requests
                </span>
              </div>
            </div>
            
            {pickupRequests.length === 0 ? (
              <p className="text-gray-600">No pickup requests yet.</p>
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
                      <strong>NGO:</strong> {request.ngo_name} ({request.ngo_email})
                    </div>
                    {request.message && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Message:</strong> {request.message}
                      </div>
                    )}
                    {request.requested_pickup_time && (
                      <div className="text-sm text-gray-500 mb-2">
                        <strong>Requested Time:</strong> {new Date(request.requested_pickup_time).toLocaleString()}
                      </div>
                    )}
                    {request.status === 'pending' && (
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleApproveRequest(request.id)}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {request.vendor_response && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                        <strong>Your Response:</strong> {request.vendor_response}
                      </div>
                    )}
                    {request.pickup_photo_url && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-600 mb-1">
                          <strong>Pickup Verification Photo:</strong>
                        </div>
                        <ImageDisplay
                          src={request.pickup_photo_url}
                          alt="Pickup verification photo"
                          className="max-w-full h-32 object-cover rounded border"
                        />
                        {request.pickup_notes && (
                          <div className="text-sm text-gray-500 mt-1">
                            <strong>NGO Notes:</strong> {request.pickup_notes}
                          </div>
                        )}
                      </div>
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