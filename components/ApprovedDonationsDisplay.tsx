'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ApprovedDonation {
  id: number
  donor_name: string
  amount?: number
  item_title?: string
  quantity?: string
  transaction_id: string
  approved_at: string
  receipt_id: string
}

interface ApprovedDonationsDisplayProps {
  upiDonationIds?: number[]
  itemDonationIds?: number[]
  title?: string
  showUPI?: boolean
  showItems?: boolean
}

export default function ApprovedDonationsDisplay({ 
  upiDonationIds,
  itemDonationIds,
  title = "Our Generous Donors",
  showUPI = true,
  showItems = true
}: ApprovedDonationsDisplayProps) {
  const [upiDonations, setUpiDonations] = useState<ApprovedDonation[]>([])
  const [itemDonations, setItemDonations] = useState<ApprovedDonation[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchApprovedDonations()
    // Auto-refresh every 30 seconds to show new approved donations
    const interval = setInterval(fetchApprovedDonations, 30000)
    return () => clearInterval(interval)
  }, [upiDonationIds, itemDonationIds])

  const fetchApprovedDonations = async () => {
    try {
      const type = showUPI && showItems ? 'all' : showUPI ? 'upi' : 'item'
      
      // Build query params
      const params = new URLSearchParams({ type })
      if (upiDonationIds && upiDonationIds.length > 0) {
        params.append('upiIds', upiDonationIds.join(','))
      }
      if (itemDonationIds && itemDonationIds.length > 0) {
        params.append('itemIds', itemDonationIds.join(','))
      }

      const response = await fetch(`/api/public/approved-donations?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setUpiDonations(data.donations.upi || [])
        setItemDonations(data.donations.items || [])
        setTotalAmount(data.summary.totalUPIDonations || 0)
      }
    } catch (error) {
      console.error('Error fetching approved donations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading donations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Donation Summary */}
      <motion.div
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {showUPI && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">₹{totalAmount.toLocaleString('en-IN')}</div>
              <div className="text-green-100">Total UPI Donations</div>
              <div className="text-sm text-green-200 mt-2">{upiDonations.length} donors</div>
            </div>
          )}
          {showItems && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-4xl font-bold mb-2">{itemDonations.length}</div>
              <div className="text-green-100">Item Donations</div>
              <div className="text-sm text-green-200 mt-2">Received & Confirmed</div>
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-4xl font-bold mb-2">
              {(upiDonations.length + itemDonations.length)}
            </div>
            <div className="text-green-100">Total Contributors</div>
            <div className="text-sm text-green-200 mt-2">Thank you! 🙏</div>
          </div>
        </div>
      </motion.div>

      {/* UPI Donations List */}
      {showUPI && upiDonations.length > 0 && (
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">💰</span>
            UPI Donations
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receipt ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upiDonations.map((donation, index) => (
                  <motion.tr
                    key={donation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mr-3">
                          {donation.donor_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {donation.donor_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-green-600">
                        ₹{Number(donation.amount).toLocaleString('en-IN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {donation.receipt_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(donation.approved_at).toLocaleDateString('en-IN')}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Item Donations List */}
      {showItems && itemDonations.length > 0 && (
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">🍱</span>
            Item Donations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemDonations.map((donation, index) => (
              <motion.div
                key={donation.id}
                className="border-2 border-gray-200 rounded-xl p-4 hover:border-green-500 hover:shadow-lg transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
                    {donation.donor_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {donation.receipt_id}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{donation.donor_name}</h4>
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-semibold">Item:</span> {donation.item_title}
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  <span className="font-semibold">Quantity:</span> {donation.quantity}
                </p>
                <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                  Confirmed: {new Date(donation.approved_at).toLocaleDateString('en-IN')}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {upiDonations.length === 0 && itemDonations.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="text-6xl mb-4">🎁</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Be the First to Contribute!
          </h3>
          <p className="text-gray-600">
            Your generous donation will be displayed here once approved by our admin.
          </p>
        </div>
      )}
    </div>
  )
}
