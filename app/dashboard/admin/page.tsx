'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAlert } from '../../../hooks/useAlert'
import { AlertModal } from '../../../components/AlertModal'

type TabId = 'overview' | 'verifications' | 'upi-donations' | 'item-donations' | 'activities' | 'deliveries' | 'gallery' | 'users' | 'listings'

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
  const [upiDonations, setUpiDonations] = useState<any[]>([])
  const [itemDonations, setItemDonations] = useState<any[]>([])
  const [donationLogs, setDonationLogs] = useState<any[]>([])
  const [loadingDonations, setLoadingDonations] = useState(true)
  const [upiPage, setUpiPage] = useState(1)
  const [itemPage, setItemPage] = useState(1)
  const [upiPagination, setUpiPagination] = useState<any>({ total: 0, totalPages: 0 })
  const [itemPagination, setItemPagination] = useState<any>({ total: 0, totalPages: 0 })
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<any>(null)
  const [collectionPhoto, setCollectionPhoto] = useState<string>('')
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)
  const [newDataAvailable, setNewDataAvailable] = useState(false)
  const [lastActivityCount, setLastActivityCount] = useState(0)
  const [processingDonations, setProcessingDonations] = useState<Set<number>>(new Set())
  const [processingGallery, setProcessingGallery] = useState<Set<number>>(new Set())
  const [processingVerifications, setProcessingVerifications] = useState<Set<number>>(new Set())

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
    fetchDonations()
    
    // Set up auto-refresh
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchActivities()
        fetchData()
        fetchGalleryPhotos()
        fetchPendingVerifications()
        fetchDonations()
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
      const token = localStorage.getItem('token')
      
      // Fetch listings
      const listingsResponse = await fetch('/api/listings', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      })
      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json()
        setListings(listingsData.listings || [])
      }

      // Fetch pickup requests
      const requestsResponse = await fetch('/api/pickup-requests', {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      })
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
        const response_data = await response.json()
        // Extract data from standardized API response
        const data = response_data.success ? response_data.data : response_data
        
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
        const response_data = await response.json()
        const data = response_data.success ? response_data.data : response_data
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
        const response_data = await response.json()
        const data = response_data.success ? response_data.data : response_data
        setPendingVerifications(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending verifications:', error)
    }
  }, [])

  const fetchDonations = useCallback(async () => {
    try {
      setLoadingDonations(true)
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('No token found')
        setLoadingDonations(false)
        return
      }

      const response = await fetch(`/api/admin/donations?page=${upiPage}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const response_data = await response.json()
        const data = response_data.success ? response_data.data : response_data
        console.log('Admin donations data:', data) // Debug log
        console.log('UPI Donations count:', data.upiDonations?.length || 0)
        console.log('Item Donations count:', data.itemDonations?.length || 0)
        setUpiDonations(data.upiDonations || [])
        setItemDonations(data.itemDonations || [])
        if (data.pagination) {
          setUpiPagination(data.pagination.upi || { total: 0, totalPages: 0 })
          setItemPagination(data.pagination.item || { total: 0, totalPages: 0 })
        }
      } else {
        console.error('Failed to fetch donations, status:', response.status)
        const errorData = await response.json()
        console.error('Error response:', errorData)
      }
      
      // Fetch donation logs
      const logsResponse = await fetch('/api/admin/donations/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (logsResponse.ok) {
        const logsResponseData = await logsResponse.json()
        const logsData = logsResponseData.success ? logsResponseData.data : logsResponseData
        console.log('Donation logs data:', logsData) // Debug log
        console.log('Donation logs count:', logsData.logs?.length || 0)
        setDonationLogs(logsData.logs || [])
      } else {
        console.error('Failed to fetch donation logs, status:', logsResponse.status)
      }
    } catch (error) {
      console.error('Failed to fetch donations:', error)
    } finally {
      setLoadingDonations(false)
    }
  }, [upiPage])

  // Refetch donations when page changes
  useEffect(() => {
    if (user) {
      fetchDonations()
    }
  }, [upiPage, user, fetchDonations])

  const handleDonationAction = async (type: 'upi' | 'item', id: number, action: string, photoData?: string) => {
    // Prevent multiple clicks
    if (processingDonations.has(id)) {
      return
    }

    try {
      // Mark as processing
      setProcessingDonations(prev => new Set(prev).add(id))

      const token = localStorage.getItem('token')
      if (!token) {
        showError('Authentication token not found')
        return
      }

      const endpoint = `/api/admin/donations/${type}/${id}/${action}`
      const body: any = { adminId: user?.id }
      
      if (type === 'item' && photoData) {
        body.approvalPhoto = photoData
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        showSuccess(`Donation ${action}d successfully!`)
        fetchDonations()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Action error response:', response.status, errorData)
        showError(errorData.message || errorData.error || `Failed to process action (Status: ${response.status})`)
      }
    } catch (error) {
      console.error('Donation action error:', error)
      showError(`Failed to process action: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      // Remove from processing after a delay
      setTimeout(() => {
        setProcessingDonations(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }, 1000)
    }
  }

  const handleGalleryAction = async (photoId: number, action: string) => {
    // Prevent multiple clicks
    if (processingGallery.has(photoId)) {
      return
    }

    try {
      // Mark as processing
      setProcessingGallery(prev => new Set(prev).add(photoId))

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
    } finally {
      // Remove from processing after a delay
      setTimeout(() => {
        setProcessingGallery(prev => {
          const next = new Set(prev)
          next.delete(photoId)
          return next
        })
      }, 1000)
    }
  }

  const handleVerificationAction = async (userId: number, action: string, adminNotes?: string) => {
    // Prevent multiple clicks
    if (processingVerifications.has(userId)) {
      return
    }

    try {
      // Mark as processing
      setProcessingVerifications(prev => new Set(prev).add(userId))

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
    } finally {
      // Remove from processing after a delay
      setTimeout(() => {
        setProcessingVerifications(prev => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }, 1000)
    }
  }

  const handleRefresh = () => {
    fetchData()
    fetchActivities()
    fetchGalleryPhotos()
    fetchPendingVerifications()
    fetchDonations()
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

      <header className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg">
                  <span className="text-3xl">🍽️</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Annadaan</h1>
                  <p className="text-primary-100 text-sm">Admin Control Center</p>
                </div>
              </div>
              {loading && (
                <div className="flex items-center text-sm text-primary-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing...
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center text-xs text-primary-100 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {lastUpdate.toLocaleTimeString()}
              </div>
              <button
                onClick={() => {
                  const token = localStorage.getItem('token')
                  window.open(`/api/admin/donations/preview-receipt?token=${token}`, '_blank')
                }}
                className="hidden lg:flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all duration-200"
                title="Preview sample PDF receipt"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Receipt</span>
              </button>
              <button
                onClick={toggleAutoRefresh}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  autoRefresh 
                    ? 'bg-green-500/20 text-green-100 hover:bg-green-500/30' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {autoRefresh ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg><span>Auto</span></>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>Manual</span></>
                )}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 disabled:opacity-50 transition-all duration-200 shadow-lg"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loading ? 'Syncing' : 'Refresh'}</span>
              </button>
              <div className="hidden lg:flex items-center space-x-3 pl-3 border-l border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-primary-100 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm">Logout</span>
                </button>
              </div>
              <button
                onClick={logout}
                className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <nav className="-mb-px flex overflow-x-auto px-6 space-x-1">
              {[
                { id: 'overview', name: 'Overview', icon: '📊', count: null },
                { id: 'verifications', name: 'Verifications', icon: '✅', count: pendingVerifications.length },
                { id: 'upi-donations', name: 'UPI Donations', icon: '💰', count: upiDonations.filter(d => d.status === 'pending').length },
                { id: 'item-donations', name: 'Item Donations', icon: '🍱', count: itemDonations.filter(d => d.status === 'pending' || d.status === 'approved').length },
                { id: 'activities', name: 'Activities', icon: '📝', count: activities.length },
                { id: 'deliveries', name: 'Deliveries', icon: '🚚', count: deliveries.length },
                { id: 'gallery', name: 'Gallery', icon: '📸', count: galleryPhotos.filter(p => !p.isApproved).length },
                { id: 'users', name: 'Users', icon: '👥', count: recentUsers.length },
                { id: 'listings', name: 'Listings', icon: '🍽️', count: listings.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className={`${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } whitespace-nowrap py-3 px-4 my-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-red-100 text-red-700'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className={`group relative bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${loading ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  {!loading && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                </div>
                <h3 className="text-sm font-medium text-blue-100 mb-1">Total Users</h3>
                <p className="text-4xl font-bold text-white mb-2">{userStats.total_users || 0}</p>
                <div className="flex items-center text-blue-100 text-sm">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  <span>+{userStats.new_users_this_month || 0} this month</span>
                </div>
              </div>
              <div className={`group relative bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${loading ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-green-100 font-medium">Available</div>
                    <div className="text-lg font-bold text-white">{rescueStats.available_listings || 0}</div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-green-100 mb-1">Food Listings</h3>
                <p className="text-4xl font-bold text-white">{rescueStats.total_listings || 0}</p>
              </div>
              <div className={`group relative bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${loading ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-purple-100 font-medium">Pending</div>
                    <div className="text-lg font-bold text-white">{rescueStats.pending_requests || 0}</div>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-purple-100 mb-1">Completed Rescues</h3>
                <p className="text-4xl font-bold text-white">{rescueStats.completed_pickups || 0}</p>
              </div>
              <div className={`group relative bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${loading ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-orange-100 mb-1">Active Partners</h3>
                <p className="text-4xl font-bold text-white mb-2">{(parseInt(userStats.total_vendors) || 0) + (parseInt(userStats.total_ngos) || 0)}</p>
                <div className="flex items-center justify-between text-orange-100 text-sm">
                  <span>🏪 {userStats.total_vendors || 0} Vendors</span>
                  <span>🏥 {userStats.total_ngos || 0} NGOs</span>
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-6 transition-all duration-300 ${loading ? 'opacity-50' : ''}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                </div>
                <div className="flex items-center space-x-3">
                  {autoRefresh && (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="font-medium">Live</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">{activities.length} activities</span>
                </div>
              </div>
              {activities.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-gray-600 font-medium">No recent activities</p>
                  <p className="text-gray-400 text-sm mt-1">Activity will appear here as users interact with the platform</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="group flex items-start space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl hover:from-primary-50 hover:to-primary-50/50 hover:shadow-md transition-all duration-200 cursor-pointer border border-transparent hover:border-primary-100">
                      <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="text-2xl">{getActivityIcon(activity.activity_type)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{activity.description}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {activity.user_name}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium bg-white shadow-sm ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
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
                          disabled={processingVerifications.has(user.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processingVerifications.has(user.id) ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Processing...
                            </>
                          ) : '✅ Approve'}
                        </button>
                        <button
                          onClick={() => {
                            const textarea = document.getElementById(`notes-${user.id}`) as HTMLTextAreaElement;
                            const notes = textarea?.value || '';
                            if (confirm('Are you sure you want to reject this user? This action cannot be easily undone.')) {
                              handleVerificationAction(user.id, 'reject', notes);
                            }
                          }}
                          disabled={processingVerifications.has(user.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processingVerifications.has(user.id) ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Processing...
                            </>
                          ) : '❌ Reject'}
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
                                disabled={processingGallery.has(photo.id)}
                                className="flex-1 bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                {processingGallery.has(photo.id) ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                  </>
                                ) : '✅ Approve'}
                              </button>
                              <button
                                onClick={() => handleGalleryAction(photo.id, 'reject')}
                                disabled={processingGallery.has(photo.id)}
                                className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                              >
                                {processingGallery.has(photo.id) ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                  </>
                                ) : '❌ Reject'}
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
                                disabled={processingGallery.has(photo.id)}
                                className={`flex-1 py-1 px-2 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  photo.isPublic 
                                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {photo.isPublic ? '👁️ Public' : '🔒 Private'}
                              </button>
                              <button
                                onClick={() => handleGalleryAction(photo.id, 'reject')}
                                disabled={processingGallery.has(photo.id)}
                                className="px-2 py-1 text-red-600 hover:text-red-800 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* UPI Donations Tab */}
        {activeTab === 'upi-donations' && (
          <div className="space-y-6">
            {/* Pending UPI Donations */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">💰 Pending UPI Donations</h2>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {loadingDonations ? '...' : upiDonations.filter(d => d.status === 'pending').length}
                </span>
              </div>
              <div className="space-y-4">
                {loadingDonations ? (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-600 mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Loading donations...</p>
                  </div>
                ) : upiDonations.filter(d => d.status === 'pending').length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-7xl mb-4">✅</div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">All Clear!</p>
                    <p className="text-gray-500">No pending UPI donations to review</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upiDonations.filter(d => d.status === 'pending').map((donation) => (
                      <div key={donation.id} className="group border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {donation.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm">#{donation.id}</h4>
                              <p className="text-xs text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                            PENDING
                          </div>
                        </div>
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 space-y-2 text-sm">
                          <div className="flex items-center text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="font-bold text-gray-900 text-lg">₹{donation.amount}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate">{donation.full_name}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="truncate text-xs">{donation.email}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{donation.phone}</span>
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 mb-3">
                          <img src={donation.payment_screenshot} alt="Payment" className="w-full h-40 object-contain rounded" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleDonationAction('upi', donation.id, 'approve')}
                            disabled={processingDonations.has(donation.id)}
                            className="flex items-center justify-center space-x-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {processingDonations.has(donation.id) ? (
                              <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDonationAction('upi', donation.id, 'reject')}
                            disabled={processingDonations.has(donation.id)}
                            className="flex items-center justify-center space-x-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-lg text-sm font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            {processingDonations.has(donation.id) ? (
                              <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Processing...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                <span>Reject</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Approved UPI Donations */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">✅ Approved UPI Donations</h2>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {upiDonations.filter(d => d.status === 'approved').length}
                  </span>
                </div>
                {upiDonations.filter(d => d.status === 'approved').length > 0 && (
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      // Fetch all approved donations for export
                      const response = await fetch('/api/admin/donations?export=true', {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        const allApproved = data.success ? data.data.upiDonations : data.upiDonations;
                        
                        const csv = [
                          ['Donor Name', 'Phone', 'Amount', 'Donation Time', 'Reviewed At'].join(','),
                          ...allApproved.map((d: any) => [
                            `"${d.full_name}"`,
                            d.phone,
                            d.amount,
                            new Date(d.created_at).toLocaleString('en-IN'),
                            d.reviewed_at ? new Date(d.reviewed_at).toLocaleString('en-IN') : 'N/A'
                          ].join(','))
                        ].join('\n');
                        
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `approved-upi-donations-${new Date().toISOString().split('T')[0]}.csv`;
                        link.click();
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export to Excel</span>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {loadingDonations ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600 mb-4"></div>
                    <p className="text-lg font-semibold text-gray-700">Loading approved donations...</p>
                  </div>
                ) : upiDonations.filter(d => d.status === 'approved').length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-5xl mb-3">💰</div>
                    <p className="text-gray-600 font-medium">No approved UPI donations yet</p>
                    <p className="text-gray-400 text-sm mt-1">Approved donations will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                        <tr>
                          <th className="px-4 py-3 font-bold text-gray-700">Donor Name</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Phone</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Amount</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Donation Time</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Reviewed At</th>
                          <th className="px-4 py-3 font-bold text-gray-700">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {upiDonations.filter(d => d.status === 'approved').map((donation, idx) => (
                          <tr key={donation.id} className={`hover:bg-green-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {donation.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold text-gray-900">{donation.full_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{donation.phone}</td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-green-700 text-lg">₹{donation.amount}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {new Date(donation.created_at).toLocaleString('en-IN', { 
                                dateStyle: 'short', 
                                timeStyle: 'short' 
                              })}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {donation.reviewed_at 
                                ? new Date(donation.reviewed_at).toLocaleString('en-IN', { 
                                    dateStyle: 'short', 
                                    timeStyle: 'short' 
                                  })
                                : 'N/A'
                              }
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => {
                                  const token = localStorage.getItem('token')
                                  window.open(`/api/admin/donations/generate-receipt/${donation.id}?type=upi&token=${token}`, '_blank')
                                }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                <span>PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Pagination Controls */}
                {!loadingDonations && upiDonations.filter(d => d.status === 'approved').length > 0 && (
                  <div className="flex items-center justify-between mt-4 px-4 py-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      {upiPagination.totalPages > 1 ? (
                        <>Showing page {upiPage} of {upiPagination.totalPages} ({upiPagination.total} total donations)</>
                      ) : (
                        <>Showing all {upiPagination.total || upiDonations.filter(d => d.status === 'approved').length} approved donations</>
                      )}
                    </div>
                    {upiPagination.totalPages > 1 && (
                      <div className="flex space-x-2">
                      <button
                        onClick={() => setUpiPage(p => Math.max(1, p - 1))}
                        disabled={upiPage === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        Previous
                      </button>
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(5, upiPagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setUpiPage(pageNum)}
                              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                                upiPage === pageNum
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {upiPagination.totalPages > 5 && <span className="px-2 py-2 text-gray-500">...</span>}
                      </div>
                      <button
                        onClick={() => setUpiPage(p => Math.min(upiPagination.totalPages, p + 1))}
                        disabled={upiPage === upiPagination.totalPages}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        Next
                      </button>
                    </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Item Donations Tab */}
        {activeTab === 'item-donations' && (
          <div className="space-y-6">
            {/* Pending Approvals */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">📋 Pending Approvals</h2>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {itemDonations.filter(d => d.status === 'pending').length}
                </span>
              </div>
              <div className="space-y-4">
                {itemDonations.filter(d => d.status === 'pending').length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-7xl mb-4">✅</div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</p>
                    <p className="text-gray-500">No pending item donations to review</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {itemDonations.filter(d => d.status === 'pending').map((donation) => (
                      <div key={donation.id} className="group border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-5 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="p-2 bg-yellow-500 rounded-lg">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">{donation.item_title}</h4>
                                <p className="text-xs text-gray-500">ID: #{donation.id}</p>
                              </div>
                            </div>
                          </div>
                          <div className="bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold">
                            PENDING
                          </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4 space-y-2.5 text-sm">
                          <div className="flex items-center text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="font-semibold">Quantity: {donation.quantity}</span>
                          </div>
                          <div className="flex items-center text-gray-700">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="truncate">{donation.full_name}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <span>{donation.phone}</span>
                          </div>
                          <div className="flex items-start text-gray-600">
                            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs break-all">{donation.email}</span>
                          </div>
                          <div className="flex items-center text-gray-700 bg-blue-50 px-2 py-1.5 rounded">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs font-medium">{new Date(donation.pickup_datetime).toLocaleString()}</span>
                          </div>
                          <div className="flex items-start text-gray-600 bg-green-50 px-2 py-1.5 rounded">
                            <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs">{donation.pickup_address}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleDonationAction('item', donation.id, 'approve')}
                            disabled={processingDonations.has(donation.id)}
                            className="flex-1 bg-green-600 text-white py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {processingDonations.has(donation.id) ? (
                              <>
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                              </>
                            ) : '✅ Approve & Notify'}
                          </button>
                          <button
                            onClick={() => handleDonationAction('item', donation.id, 'reject')}
                            disabled={processingDonations.has(donation.id)}
                            className="flex-1 bg-red-600 text-white py-2 rounded text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {processingDonations.has(donation.id) ? (
                              <>
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Processing...
                              </>
                            ) : '❌ Reject'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Approved - Awaiting Collection */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🚚 Approved - Awaiting Collection</h2>
              <div className="space-y-4">
                {(() => {
                  const approvedItems = itemDonations.filter(d => d.status === 'approved')
                  console.log('Total item donations:', itemDonations.length)
                  console.log('Approved items:', approvedItems.length)
                  console.log('Item donations statuses:', itemDonations.map(d => `${d.id}: ${d.status}`))
                  
                  return approvedItems.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-gray-600">No items awaiting collection</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {approvedItems.map((donation) => (
                      <div key={donation.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{donation.item_title}</h4>
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">APPROVED</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1 mb-3">
                          <div>📦 Quantity: {donation.quantity}</div>
                          <div>👤 {donation.full_name}</div>
                          <div>📱 {donation.phone}</div>
                          <div>📅 Collection: {new Date(donation.pickup_datetime).toLocaleString()}</div>
                          <div>📍 {donation.pickup_address}</div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedDonation(donation)
                            setShowCollectionModal(true)
                          }}
                          className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700 font-semibold"
                        >
                          📸 Upload Photo & Mark Collected
                        </button>
                      </div>
                    ))}
                  </div>
                  )
                })()}
              </div>
            </div>

            {/* Collected Items */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Recently Collected</h2>
              <div className="space-y-3">
                {itemDonations.filter(d => d.status === 'collected').slice(0, 10).map((donation) => (
                  <div key={donation.id} className="border border-gray-200 rounded-lg p-4 flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{donation.item_title}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        <div>📦 {donation.quantity} • 👤 {donation.full_name}</div>
                        <div>✅ Collected: {new Date(donation.collected_at || '').toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => {
                          const token = localStorage.getItem('token')
                          window.open(`/api/admin/donations/generate-receipt/${donation.id}?token=${token}`, '_blank')
                        }}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        📄 Download Receipt
                      </button>
                    </div>
                    {donation.approval_photo && (
                      <img 
                        src={donation.approval_photo} 
                        alt="Collection photo" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Donation Logs */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📜 Donation Activity Logs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Time</th>
                      <th className="px-4 py-3 text-left font-semibold">Type</th>
                      <th className="px-4 py-3 text-left font-semibold">Donor</th>
                      <th className="px-4 py-3 text-left font-semibold">Action</th>
                      <th className="px-4 py-3 text-left font-semibold">By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donationLogs.slice(0, 50).map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.donation_type === 'upi' 
                              ? 'bg-purple-100 text-purple-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {log.type_label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-900">{log.donor_name}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${
                            log.action === 'approve' ? 'text-green-600' :
                            log.action === 'reject' ? 'text-red-600' :
                            log.action === 'collected' ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>
                            {log.action.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {log.admin_name || log.donor_name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Collection Photo Modal */}
        {showCollectionModal && selectedDonation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <h3 className="text-2xl font-bold mb-4">📸 Collection Confirmation</h3>
              
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">{selectedDonation.item_title}</h4>
                <div className="text-sm text-gray-600">
                  <div>👤 {selectedDonation.full_name}</div>
                  <div>📦 {selectedDonation.quantity}</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Upload Collection Photo</label>
                {!collectionPhoto ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploadingPhoto(true)
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            setCollectionPhoto(reader.result as string)
                            setIsUploadingPhoto(false)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                      id="collection-photo"
                    />
                    <label htmlFor="collection-photo" className="cursor-pointer">
                      {isUploadingPhoto ? (
                        <div>Loading...</div>
                      ) : (
                        <>
                          <div className="text-4xl mb-2">📷</div>
                          <p className="text-gray-600">Tap to capture photo</p>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img src={collectionPhoto} alt="Collection" className="w-full rounded-lg" />
                    <button
                      onClick={() => setCollectionPhoto('')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCollectionModal(false)
                    setSelectedDonation(null)
                    setCollectionPhoto('')
                  }}
                  className="flex-1 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!collectionPhoto) {
                      showError('Please upload a photo')
                      return
                    }
                    await handleDonationAction('item', selectedDonation.id, 'collected', collectionPhoto)
                    setShowCollectionModal(false)
                    setSelectedDonation(null)
                    setCollectionPhoto('')
                  }}
                  disabled={!collectionPhoto || (selectedDonation && processingDonations.has(selectedDonation.id))}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {selectedDonation && processingDonations.has(selectedDonation.id) ? (
                    <>
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : '✅ Confirm Collection'}
                </button>
              </div>
            </div>
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
