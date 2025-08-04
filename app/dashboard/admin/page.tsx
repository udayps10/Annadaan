'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAlert } from '../../../hooks/useAlert'
import { AlertModal } from '../../../components/AlertModal'

export default function AdminDashboard() {
  const { alertState, showSuccess, showError, hideAlert } = useAlert()
  const [user, setUser] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [pickupRequests, setPickupRequests] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([])
  const [userStats, setUserStats] = useState<any>({})
  const [rescueStats, setRescueStats] = useState<any>({})
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [newDataAvailable, setNewDataAvailable] = useState(false)
  const [lastActivityCount, setLastActivityCount] = useState(0)

  useEffect(() => {
    const userType = localStorage.getItem('userType')
    const userEmail = localStorage.getItem('userEmail')
    const userName = localStorage.getItem('userName')
    
    if (!userType || userType !== 'admin') {
      window.location.href = '/login'
      return
    }

    setUser({ email: userEmail, name: userName, type: userType })
    fetchData()
    fetchActivities()
    fetchGalleryPhotos()
    fetchPendingVerifications()
    
    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchActivities()
        fetchData()
        fetchGalleryPhotos()
        fetchPendingVerifications()
      }, 30000) // Refresh every 30 seconds
      setRefreshInterval(interval)
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
      }
    }
  }, [autoRefresh])

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch listings
      const listingsResponse = await fetch('/api/listings')
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json()
        setListings(listingsData.listings || [])
      }

      // Fetch pickup requests
      const requestsResponse = await fetch('/api/pickup-requests')
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setPickupRequests(requestsData.requests || [])
      }
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActivities = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/admin/activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const newActivities = data.activities || []
        
        // Check if there are new activities
        if (newActivities.length > lastActivityCount && lastActivityCount > 0) {
          setNewDataAvailable(true)
          setTimeout(() => setNewDataAvailable(false), 3000) // Hide notification after 3 seconds
        }
        
        setActivities(newActivities)
        setDeliveries(data.deliveries || [])
        setUserStats(data.userStats || {})
        setRescueStats(data.rescueStats || {})
        setRecentUsers(data.recentUsers || [])
        setLastUpdate(new Date())
        setLastActivityCount(newActivities.length)
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    }
  }, [])

  const fetchGalleryPhotos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/admin/gallery', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setGalleryPhotos(data.photos || [])
      }
    } catch (error) {
      console.error('Failed to fetch gallery photos:', error)
    }
  }, [])

  const fetchPendingVerifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/admin/verification', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPendingVerifications(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error)
    }
  }, [])

  const handleGalleryAction = async (photoId: number, action: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ photoId, action })
      })
      
      if (response.ok) {
        const data = await response.json()
        showSuccess(data.message)
        fetchGalleryPhotos() // Refresh the gallery
      } else {
        const error = await response.json()
        showError(error.message || 'Action failed')
      }
    } catch (error) {
      console.error('Gallery action failed:', error)
      showError('Action failed')
    }
  }

  const handleVerificationAction = async (userId: number, action: string, adminNotes?: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, action, adminNotes })
      })
      
      if (response.ok) {
        const data = await response.json()
        showSuccess(data.message)
        fetchPendingVerifications() // Refresh the verification list
      } else {
        const error = await response.json()
        showError(error.message || 'Verification action failed')
      }
    } catch (error) {
      console.error('Verification action failed:', error)
      showError('Verification action failed')
    }
  }

  const handleRefresh = () => {
    fetchData()
    fetchActivities()
    fetchGalleryPhotos()
    fetchPendingVerifications()
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    if (!autoRefresh) {
      const interval = setInterval(() => {
        fetchActivities()
        fetchData()
        fetchGalleryPhotos()
        fetchPendingVerifications()
      }, 30000)
      setRefreshInterval(interval)
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        setRefreshInterval(null)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'approved': return 'text-blue-600'
      case 'completed': return 'text-green-600'
      case 'rejected': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'listing_created': return '📝'
      case 'pickup_requested': return '📋'
      case 'pickup_status_change': return '🔄'
      default: return '📌'
    }
  }

  const logout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* New Data Notification */}
      {newDataAvailable && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-right">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">🔄 New data available!</span>
            <button 
              onClick={() => setNewDataAvailable(false)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">🍽️ Annadaan</h1>
              <span className="ml-4 text-gray-600">Admin Dashboard</span>
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
              <span className="text-gray-700">Welcome, {user.name}!</span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: '📊', count: null },
                { id: 'verifications', name: 'Verifications', icon: '✅', count: pendingVerifications.length },
                { id: 'activities', name: 'Activities', icon: '📝', count: activities.length },
                { id: 'deliveries', name: 'Deliveries', icon: '🚚', count: deliveries.length },
                { id: 'gallery', name: 'Gallery', icon: '📸', count: galleryPhotos.filter(p => !p.isApproved).length },
                { id: 'users', name: 'Users', icon: '👥', count: recentUsers.length },
                { id: 'listings', name: 'Listings', icon: '🍽️', count: listings.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                  {tab.count !== null && (
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-primary-100 text-primary-600' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                <p className="text-3xl font-bold text-primary-600">{userStats.total_users || 0}</p>
                <p className="text-sm text-gray-500 mt-1">+{userStats.new_users_this_month || 0} this month</p>
                {!loading && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
              </div>
              <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900">Food Listings</h3>
                <p className="text-3xl font-bold text-green-600">{rescueStats.total_listings || 0}</p>
                <p className="text-sm text-gray-500 mt-1">{rescueStats.available_listings || 0} available</p>
              </div>
              <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900">Completed Rescues</h3>
                <p className="text-3xl font-bold text-blue-600">{rescueStats.completed_pickups || 0}</p>
                <p className="text-sm text-gray-500 mt-1">{rescueStats.pending_requests || 0} pending</p>
              </div>
              <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
                <h3 className="text-lg font-semibold text-gray-900">Active Partners</h3>
                <p className="text-3xl font-bold text-purple-600">{(parseInt(userStats.total_vendors) || 0) + (parseInt(userStats.total_ngos) || 0)}</p>
                <p className="text-sm text-gray-500 mt-1">{userStats.total_vendors || 0} vendors, {userStats.total_ngos || 0} NGOs</p>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                <div className="flex items-center space-x-2">
                  {autoRefresh && (
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      Live
                    </div>
                  )}
                  <span className="text-xs text-gray-500">{activities.length} activities</span>
                </div>
              </div>
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activities</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <span className="text-xl">{getActivityIcon(activity.activity_type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {activity.user_name} • {formatDate(activity.timestamp)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full bg-gray-100 ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Activities (Last 30 Days)</h2>
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activities found</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                            <p className="text-gray-600 text-sm">{activity.description}</p>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                              <span>User: {activity.user_name}</span>
                              <span>Role: {activity.user_role}</span>
                              {activity.business_name && <span>Organization: {activity.business_name}</span>}
                              <span>Time: {formatDate(activity.timestamp)}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)} bg-gray-100`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'deliveries' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Completed Deliveries</h2>
            {deliveries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No completed deliveries yet</p>
            ) : (
              <div className="space-y-6">
                {deliveries.map((delivery, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{delivery.food_title}</h3>
                        <p className="text-gray-600">{delivery.food_description}</p>
                        <p className="text-sm text-gray-500 mt-1">Quantity: {delivery.quantity}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Completed
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">From (Vendor)</h4>
                        <p className="text-sm text-gray-600">{delivery.vendor_name}</p>
                        {delivery.business_name && (
                          <p className="text-sm text-gray-500">{delivery.business_name}</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">To (NGO)</h4>
                        <p className="text-sm text-gray-600">{delivery.ngo_name}</p>
                        {delivery.organization_name && (
                          <p className="text-sm text-gray-500">{delivery.organization_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                          <p className="text-sm text-gray-600">Requested: {formatDate(delivery.requested_at)}</p>
                          <p className="text-sm text-gray-600">Completed: {formatDate(delivery.completed_at)}</p>
                        </div>
                        {delivery.pickup_photo_url && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Verification Photo</h4>
                            <img 
                              src={delivery.pickup_photo_url} 
                              alt="Pickup verification"
                              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                      </div>
                      
                      {delivery.pickup_notes && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-1">Pickup Notes</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{delivery.pickup_notes}</p>
                        </div>
                      )}
                      
                      {delivery.vendor_response && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-1">Vendor Response</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{delivery.vendor_response}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent User Registrations</h2>
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map((user, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600 text-sm">{user.email}</p>
                        {user.organization_name && (
                          <p className="text-gray-500 text-sm">{user.organization_name}</p>
                        )}
                        <p className="text-gray-400 text-xs mt-1">Registered: {formatDate(user.created_at)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">User Verification Management</h2>
              <span className="text-sm text-gray-500">
                {pendingVerifications.length} pending verification{pendingVerifications.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {pendingVerifications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-500">No pending verifications</p>
                <p className="text-sm text-gray-400 mt-2">
                  All users are verified or no new registrations
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingVerifications.map((user) => (
                  <div key={user.id} className="border border-yellow-200 bg-yellow-50 rounded-lg p-6">
                    {/* User Basic Info */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                        <p className="text-sm text-gray-500">
                          Registered: {formatDate(user.created_at)} • Status: 
                          <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            {user.status}
                          </span>
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        user.role === 'vendor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </div>

                    {/* Profile Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Profile Information</h4>
                        <div className="space-y-2 text-sm">
                          <div><span className="font-medium">Phone:</span> {user.phone || 'Not provided'}</div>
                          <div><span className="font-medium">Address:</span> {user.address || 'Not provided'}</div>
                          {user.role === 'vendor' && (
                            <>
                              <div><span className="font-medium">Business Name:</span> {user.business_name || 'Not provided'}</div>
                              <div><span className="font-medium">Business Type:</span> {user.business_type || 'Not provided'}</div>
                              <div><span className="font-medium">Registration Number:</span> {user.registration_number || 'Not provided'}</div>
                            </>
                          )}
                          {user.role === 'ngo' && (
                            <>
                              <div><span className="font-medium">Organization Name:</span> {user.organization_name || 'Not provided'}</div>
                              <div><span className="font-medium">License Number:</span> {user.license_number || 'Not provided'}</div>
                              <div><span className="font-medium">Service Areas:</span> {user.service_areas || 'Not provided'}</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Documents */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Uploaded Documents</h4>
                        {user.documents && user.documents.length > 0 ? (
                          <div className="space-y-2">
                            {user.documents.map((doc: any) => (
                              <div key={doc.id} className="flex items-center justify-between bg-white p-3 rounded border">
                                <div>
                                  <p className="font-medium text-sm">{doc.document_type.replace('_', ' ').toUpperCase()}</p>
                                  <p className="text-xs text-gray-500">
                                    {doc.file_type} • Uploaded {formatDate(doc.uploaded_at)}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      const token = localStorage.getItem('token');
                                      window.open(`/api/admin/verification/documents/${doc.id}/view?token=${token}`, '_blank');
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      const token = localStorage.getItem('token');
                                      window.open(`/api/admin/verification/documents/${doc.id}/download?token=${token}`, '_blank');
                                    }}
                                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No documents uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {user.admin_notes && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Previous Admin Notes</h4>
                        <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded">{user.admin_notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Admin Notes (optional)
                        </label>
                        <textarea
                          id={`notes-${user.id}`}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          rows={2}
                          placeholder="Add any notes about this verification..."
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                        <button
                          onClick={() => {
                            const textarea = document.getElementById(`notes-${user.id}`) as HTMLTextAreaElement;
                            const notes = textarea?.value || '';
                            if (confirm('Are you sure you want to approve this user?')) {
                              handleVerificationAction(user.id, 'approve', notes);
                            }
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => {
                            const textarea = document.getElementById(`notes-${user.id}`) as HTMLTextAreaElement;
                            const notes = textarea?.value || '';
                            if (confirm('Are you sure you want to reject this user? This action cannot be easily undone.')) {
                              handleVerificationAction(user.id, 'reject', notes);
                            }
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Listings Tab (existing content) */}
        {activeTab === 'listings' && (
          <>
            {/* Recent Listings */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Food Listings</h2>
              
              {listings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No food listings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {listings.slice(0, 10).map((listing) => (
                    <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                          <p className="text-gray-600 text-sm">{listing.description}</p>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>Quantity: {listing.quantity} {listing.unit}</span>
                            <span>Category: {listing.category}</span>
                            <span>Vendor: {listing.vendor_name || listing.business_name}</span>
                            <span>Status: <span className={`font-medium ${listing.status === 'available' ? 'text-green-600' : 'text-yellow-600'}`}>{listing.status}</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Pickup Requests */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Pickup Requests</h2>
              
              {pickupRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pickup requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pickupRequests.slice(0, 10).map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.listing_title}</h3>
                          <p className="text-gray-600 text-sm">Requested by: {request.ngo_name || request.organization_name}</p>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>Requested: {request.requested_quantity} {request.unit}</span>
                            <span>Status: <span className={`font-medium ${request.status === 'pending' ? 'text-yellow-600' : request.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>{request.status}</span></span>
                          </div>
                          {request.notes && (
                            <p className="text-sm text-gray-500 mt-1">Notes: {request.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Community Impact Gallery</h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {galleryPhotos.filter(p => !p.isApproved).length} pending approval
                </span>
                <a
                  href="/gallery"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  View Public Gallery →
                </a>
              </div>
            </div>
            
            {galleryPhotos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📸</div>
                <p className="text-gray-500">No gallery photos yet</p>
                <p className="text-sm text-gray-400 mt-2">
                  Users can upload impact photos from the gallery page
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Approval */}
                {galleryPhotos.filter(p => !p.isApproved).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      📋 Pending Approval ({galleryPhotos.filter(p => !p.isApproved).length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {galleryPhotos.filter(p => !p.isApproved).map((photo) => (
                        <div key={photo.id} className="border border-yellow-200 bg-yellow-50 rounded-lg overflow-hidden">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={photo.photoUrl}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-1">{photo.title}</h4>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{photo.description}</p>
                            <div className="text-xs text-gray-500 mb-3">
                              <div>📍 {photo.location || 'No location'}</div>
                              <div>👥 {photo.peopleHelped || 0} people helped</div>
                              <div>👤 By: {photo.organizationName || photo.userFullName}</div>
                              <div>📅 {formatDate(photo.createdAt)}</div>
                            </div>
                            
                            {photo.tags && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {(() => {
                                  try {
                                    const tags = typeof photo.tags === 'string' ? JSON.parse(photo.tags) : photo.tags;
                                    return Array.isArray(tags) ? tags.slice(0, 2).map((tag: string) => (
                                      <span key={tag} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    )) : [];
                                  } catch (e) {
                                    return [];
                                  }
                                })()}
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleGalleryAction(photo.id, 'approve')}
                                className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => handleGalleryAction(photo.id, 'reject')}
                                className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Photos */}
                {galleryPhotos.filter(p => p.isApproved).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      ✅ Approved Photos ({galleryPhotos.filter(p => p.isApproved).length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {galleryPhotos.filter(p => p.isApproved).slice(0, 8).map((photo) => (
                        <div key={photo.id} className="border border-green-200 bg-green-50 rounded-lg overflow-hidden">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={photo.photoUrl}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{photo.title}</h4>
                            <div className="text-xs text-gray-500 mb-2">
                              <div>👥 {photo.peopleHelped || 0} helped</div>
                              <div>👤 {photo.organizationName || photo.userFullName}</div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleGalleryAction(photo.id, 'toggle_public')}
                                className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
                                  photo.isPublic 
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {photo.isPublic ? '👁️ Public' : '🔒 Private'}
                              </button>
                              <button
                                onClick={() => handleGalleryAction(photo.id, 'reject')}
                                className="px-2 py-1 text-red-600 hover:text-red-800 text-xs"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {galleryPhotos.filter(p => p.isApproved).length > 8 && (
                      <div className="text-center mt-4">
                        <p className="text-sm text-gray-500">
                          ... and {galleryPhotos.filter(p => p.isApproved).length - 8} more approved photos
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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
