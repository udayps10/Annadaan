'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
}

interface UPIDonation {
  id: number
  transaction_id?: string
  payment_screenshot: string
  status: 'pending' | 'approved' | 'rejected'
  receipt_sent: number
  created_at: string
  reviewed_at?: string
  reviewed_by?: number
}

interface ItemDonation {
  id: number
  transaction_id?: string
  item_title: string
  pickup_datetime: string
  pickup_address: string
  approval_photo?: string
  status: 'pending' | 'approved' | 'rejected' | 'collected'
  created_at: string
  collected_at?: string
  reviewed_by?: number
}

export default function MyDonationsPage() {
  const router = useRouter()
  const [donorId, setDonorId] = useState<string | null>(null)
  const [upiDonations, setUpiDonations] = useState<UPIDonation[]>([])
  const [itemDonations, setItemDonations] = useState<ItemDonation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'upi' | 'items'>('upi')

  useEffect(() => {
    const storedDonorId = sessionStorage.getItem('donorId')
    if (!storedDonorId) {
      router.push('/donation-drive/register')
      return
    }
    setDonorId(storedDonorId)
    fetchDonations(storedDonorId)
  }, [router])

  const fetchDonations = async (id: string) => {
    try {
      const response = await fetch(`/api/donation-drive/my-donations?donorId=${id}`)
      const response_data = await response.json()

      if (!response.ok) {
        throw new Error(response_data.error || response_data.message || 'Failed to fetch donations')
      }

      // Extract data from standardized API response format
      // API returns: { success: true, data: { upiDonations, itemDonations }, message: '...' }
      const data = response_data.success ? response_data.data : response_data

      console.log('Fetched donations data:', data) // Debug log
      console.log('UPI Donations count:', data.upiDonations?.length || 0)
      console.log('Item Donations count:', data.itemDonations?.length || 0)

      setUpiDonations(data.upiDonations || [])
      setItemDonations(data.itemDonations || [])
      setError('') // Clear any previous errors
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load donations')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      collected: 'bg-blue-100 text-blue-800 border-blue-300'
    }
    const icons = {
      pending: '⏳',
      approved: '✅',
      rejected: '❌',
      collected: '📦'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]} {status.toUpperCase()}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!donorId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your donations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Navigation */}
      <motion.nav 
        className="bg-white/95 backdrop-blur-md border-b border-green-200 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  🍽️ Annadaan
                </h1>
              </Link>
            </motion.div>
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                href="/donation-drive/donate" 
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center group"
              >
                <span className="mr-2">➕</span>
                New Donation
              </Link>
              <Link 
                href="/donation-drive" 
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center group"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform">←</span>
                Back
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {/* Header */}
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              My Donations
            </h1>
            <p className="text-lg text-gray-600">
              Track all your contributions to the Republic Day donation drive
            </p>
          </motion.div>

          {/* Error Display */}
          {error && (
            <motion.div 
              className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8"
              variants={fadeInUp}
            >
              <p className="text-sm text-red-800 flex items-start">
                <span className="mr-2 text-lg">❌</span>
                <span>{error}</span>
              </p>
            </motion.div>
          )}

          {/* Tabs */}
          <motion.div 
            className="flex justify-center space-x-4 mb-8"
            variants={fadeInUp}
          >
            <button
              onClick={() => setActiveTab('upi')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'upi'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              💰 UPI Donations ({upiDonations.length})
            </button>
            <button
              onClick={() => setActiveTab('items')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'items'
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🍱 Item Donations ({itemDonations.length})
            </button>
          </motion.div>

          {/* UPI Donations Tab */}
          {activeTab === 'upi' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {upiDonations.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No UPI Donations Yet</h3>
                  <p className="text-gray-600 mb-6">You haven't made any UPI donations yet.</p>
                  <Link 
                    href="/donation-drive/donate/upi"
                    className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Make Your First Donation
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {upiDonations.map((donation, index) => (
                    <motion.div
                      key={donation.id}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Screenshot Preview */}
                        <div className="lg:w-48 flex-shrink-0">
                          <img 
                            src={donation.payment_screenshot} 
                            alt="Payment screenshot" 
                            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                UPI Donation #{donation.id}
                              </h3>
                              {donation.transaction_id && (
                                <p className="text-xs font-mono text-gray-500 mb-1">
                                  🔖 Transaction ID: {donation.transaction_id}
                                </p>
                              )}
                              <p className="text-sm text-gray-600">
                                Submitted: {formatDate(donation.created_at)}
                              </p>
                            </div>
                            {getStatusBadge(donation.status)}
                          </div>

                          {donation.status === 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800">
                                ⏳ Your donation is under review. You'll receive an email once approved.
                              </p>
                            </div>
                          )}

                          {donation.status === 'approved' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm text-green-800">
                                ✅ Approved on {donation.reviewed_at ? formatDate(donation.reviewed_at) : 'N/A'}
                                {donation.receipt_sent ? ' • Receipt sent to your email' : ' • Receipt pending'}
                              </p>
                            </div>
                          )}

                          {donation.status === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm text-red-800">
                                ❌ This donation was not approved. Please contact admin for details.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Item Donations Tab */}
          {activeTab === 'items' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {itemDonations.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">🍱</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Item Donations Yet</h3>
                  <p className="text-gray-600 mb-6">You haven't scheduled any item donations yet.</p>
                  <Link 
                    href="/donation-drive/donate/item"
                    className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all"
                  >
                    Schedule a Pickup
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {itemDonations.map((donation, index) => (
                    <motion.div
                      key={donation.id}
                      className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {donation.item_title}
                          </h3>
                          {donation.transaction_id && (
                            <p className="text-xs font-mono text-gray-500 mb-1">
                              🔖 Transaction ID: {donation.transaction_id}
                            </p>
                          )}
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>📅 Pickup: {formatDate(donation.pickup_datetime)}</p>
                            <p>📍 {donation.pickup_address}</p>
                            <p>Submitted: {formatDate(donation.created_at)}</p>
                          </div>
                        </div>
                        {getStatusBadge(donation.status)}
                      </div>

                      {donation.status === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            ⏳ Pickup scheduled. Our team will arrive at the specified time.
                          </p>
                        </div>
                      )}

                      {donation.status === 'collected' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-800 mb-2">
                            📦 Collected on {donation.collected_at ? formatDate(donation.collected_at) : 'N/A'}
                          </p>
                          {donation.approval_photo && (
                            <img 
                              src={donation.approval_photo} 
                              alt="Collection proof" 
                              className="w-full max-w-md h-48 object-cover rounded-lg border-2 border-blue-200 mt-2"
                            />
                          )}
                        </div>
                      )}

                      {donation.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-800">
                            ❌ This donation request was not approved. Please contact admin for details.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
