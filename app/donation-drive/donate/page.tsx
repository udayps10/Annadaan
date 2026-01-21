'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
}

export default function DonatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [donorId, setDonorId] = useState<string | null>(null)
  const preselectedType = searchParams.get('type') // 'upi' or 'item'

  useEffect(() => {
    // Check if user is registered
    const storedDonorId = sessionStorage.getItem('donorId')
    if (!storedDonorId) {
      // Redirect to registration if not registered
      router.push('/donation-drive/register')
      return
    }
    setDonorId(storedDonorId)

    // If type is preselected, redirect to respective page
    if (preselectedType === 'upi') {
      router.push('/donation-drive/donate/upi')
    } else if (preselectedType === 'item') {
      router.push('/donation-drive/donate/item')
    }
  }, [preselectedType, router])

  const handleDonationType = (type: 'upi' | 'item') => {
    router.push(`/donation-drive/donate/${type}`)
  }

  if (!donorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking registration status...</p>
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
                href="/donation-drive/my-donations" 
                className="text-gray-700 hover:text-orange-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center group"
              >
                <span className="mr-2">📊</span>
                My Donations
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
        >
          {/* Header */}
          <motion.div className="text-center mb-12" variants={fadeInUp}>
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm font-semibold">
                <span className="mr-2 text-xl">🎁</span>
                Step 2 of 2
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Choose Your Donation Type
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select how you'd like to contribute to our Republic Day donation drive
            </p>
          </motion.div>

          {/* Donation Type Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* UPI Donation Card */}
            <motion.div 
              className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => handleDonationType('upi')}
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-12 text-white relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 90, 0]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="text-6xl mb-6"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  💰
                </motion.div>
                <h2 className="text-3xl font-bold mb-3">UPI Donation</h2>
                <p className="text-blue-100 text-lg">Quick & Secure Monetary Contribution</p>
              </div>
              
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Instant Payment</p>
                      <p className="text-gray-600 text-sm">Pay via any UPI app in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">QR Code Provided</p>
                      <p className="text-gray-600 text-sm">Scan our QR to complete payment</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Email Receipt</p>
                      <p className="text-gray-600 text-sm">Get confirmation after approval</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg text-center font-semibold group-hover:from-blue-700 group-hover:to-purple-700 transition-all">
                  Donate via UPI →
                </div>
              </div>
            </motion.div>

            {/* Food/Item Donation Card */}
            <motion.div 
              className="group bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => handleDonationType('item')}
            >
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-12 text-white relative overflow-hidden">
                <motion.div 
                  className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -90, 0]
                  }}
                  transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div 
                  className="text-6xl mb-6"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  🍱
                </motion.div>
                <h2 className="text-3xl font-bold mb-3">Food & Items</h2>
                <p className="text-orange-100 text-lg">Donate Physical Goods & Essentials</p>
              </div>
              
              <div className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Flexible Items</p>
                      <p className="text-gray-600 text-sm">Food, clothes, or any essentials</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Scheduled Pickup</p>
                      <p className="text-gray-600 text-sm">Choose date & time that works for you</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-3 text-2xl flex-shrink-0">✓</span>
                    <div>
                      <p className="font-semibold text-gray-900">Photo Proof</p>
                      <p className="text-gray-600 text-sm">Receive collection confirmation</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-lg text-center font-semibold group-hover:from-orange-700 group-hover:to-red-700 transition-all">
                  Donate Food/Items →
                </div>
              </div>
            </motion.div>
          </div>

          {/* Help Section */}
          <motion.div 
            className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200"
            variants={fadeInUp}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="text-5xl flex-shrink-0">💡</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Not sure which option to choose?
                </h3>
                <p className="text-gray-700 mb-4">
                  <strong>Choose UPI</strong> if you want to make an instant monetary contribution. 
                  <strong> Choose Food/Items</strong> if you have surplus food, clothes, or essential items to donate.
                </p>
                <p className="text-gray-600 text-sm">
                  You can donate multiple times! Both donation types are equally valuable to our cause.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Back Link */}
          <motion.div 
            className="mt-8 text-center"
            variants={fadeInUp}
          >
            <Link href="/donation-drive" className="text-gray-600 hover:text-orange-600 font-semibold transition-colors">
              ← Back to Event Page
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
