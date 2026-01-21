'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
}

export default function ItemDonationPage() {
  const router = useRouter()
  const [donorId, setDonorId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    itemTitle: '',
    quantity: '',
    pickupDate: '',
    pickupTime: '',
    pickupAddress: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const storedDonorId = sessionStorage.getItem('donorId')
    if (!storedDonorId) {
      router.push('/donation-drive/register')
      return
    }
    setDonorId(storedDonorId)
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.itemTitle.trim()) {
      newErrors.itemTitle = 'Item title/description is required'
    } else if (formData.itemTitle.trim().length < 5) {
      newErrors.itemTitle = 'Please provide a detailed description (at least 5 characters)'
    }

    // Quantity validation
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required'
    } else if (formData.quantity.trim().length < 2) {
      newErrors.quantity = 'Please specify quantity (e.g., "10 kg", "5 boxes", "20 items")'
    }

    if (!formData.pickupDate) {
      newErrors.pickupDate = 'Pickup date is required'
    } else {
      const selectedDate = new Date(formData.pickupDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.pickupDate = 'Pickup date cannot be in the past'
      }
    }

    if (!formData.pickupTime) {
      newErrors.pickupTime = 'Pickup time is required'
    }

    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'Pickup address is required'
    } else if (formData.pickupAddress.trim().length < 10) {
      newErrors.pickupAddress = 'Please provide a complete address (at least 10 characters)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setSubmitError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!donorId) {
      setSubmitError('Donor ID not found. Please register again.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Combine date and time into MySQL datetime format
      const pickupDatetime = new Date(`${formData.pickupDate}T${formData.pickupTime}:00`)
      const mysqlDatetime = pickupDatetime.getFullYear() + '-' + 
        String(pickupDatetime.getMonth() + 1).padStart(2, '0') + '-' + 
        String(pickupDatetime.getDate()).padStart(2, '0') + ' ' + 
        String(pickupDatetime.getHours()).padStart(2, '0') + ':' + 
        String(pickupDatetime.getMinutes()).padStart(2, '0') + ':00'

      const response = await fetch('/api/donation-drive/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId: parseInt(donorId),
          itemTitle: formData.itemTitle,
          quantity: formData.quantity,
          pickupDatetime: mysqlDatetime,
          pickupAddress: formData.pickupAddress
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit donation')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/donation-drive/my-donations')
      }, 2000)
    } catch (err) {
      console.error('Submission error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit donation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!donorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
        <motion.div 
          className="text-center max-w-md mx-auto p-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="text-7xl mb-6"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.6 }}
          >
            ✅
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Donation Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your item donation request has been submitted successfully. Our team will collect 
            the items at your scheduled time and provide photo confirmation.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to your donations dashboard...
          </div>
        </motion.div>
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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                href="/donation-drive/donate" 
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
          <motion.div className="text-center mb-8" variants={fadeInUp}>
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm font-semibold">
                <span className="mr-2 text-xl">🍱</span>
                Item Donation
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Donate Food & Items
            </h1>
            <p className="text-lg text-gray-600">
              Schedule a pickup for your donation items
            </p>
          </motion.div>

          {/* Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 lg:p-10"
            variants={fadeInUp}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Title/Description */}
              <div>
                <label htmlFor="itemTitle" className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="itemTitle"
                  name="itemTitle"
                  value={formData.itemTitle}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.itemTitle ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none`}
                  placeholder="E.g., 5 kg rice, 10 packets of biscuits, used clothes..."
                  disabled={isSubmitting}
                />
                {errors.itemTitle && (
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.itemTitle}
                  </motion.p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  📝 Please provide detailed description of items you want to donate
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none`}
                  placeholder="E.g., 10 kg, 5 boxes, 20 items"
                  disabled={isSubmitting}
                />
                {errors.quantity && (
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.quantity}
                  </motion.p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  📦 Specify quantity with unit (kg, boxes, items, etc.)
                </p>
              </div>

              {/* Pickup Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pickupDate" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pickup Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="pickupDate"
                    name="pickupDate"
                    value={formData.pickupDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.pickupDate ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none`}
                    disabled={isSubmitting}
                  />
                  {errors.pickupDate && (
                    <motion.p 
                      className="mt-2 text-sm text-red-600 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="mr-1">⚠️</span> {errors.pickupDate}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label htmlFor="pickupTime" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pickup Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="pickupTime"
                    name="pickupTime"
                    value={formData.pickupTime}
                    onChange={handleInputChange}
                    step="900"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.pickupTime ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                    } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none`}
                    disabled={isSubmitting}
                  />
                  {errors.pickupTime && (
                    <motion.p 
                      className="mt-2 text-sm text-red-600 flex items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="mr-1">⚠️</span> {errors.pickupTime}
                    </motion.p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    🕐 Select pickup time (15-minute intervals)
                  </p>
                </div>
              </div>

              {/* Pickup Address */}
              <div>
                <label htmlFor="pickupAddress" className="block text-sm font-semibold text-gray-700 mb-2">
                  Pickup Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.pickupAddress ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none`}
                  placeholder="Enter complete address with landmarks"
                  disabled={isSubmitting}
                />
                {errors.pickupAddress && (
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.pickupAddress}
                  </motion.p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  📍 Include house/flat number, street name, area, and nearby landmarks
                </p>
              </div>

              {/* Submit Error */}
              {submitError && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-sm text-red-800 flex items-start">
                    <span className="mr-2 text-lg">❌</span>
                    <span>{submitError}</span>
                  </p>
                </motion.div>
              )}

              {/* Info Box - Only show if no error */}
              {!submitError && (
                <motion.div 
                  className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200"
                  variants={fadeInUp}
                >
                  <p className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2 text-lg">ℹ️</span>
                    <span>
                      Our team will arrive at your location on the scheduled date and time. 
                      Once items are collected, you'll receive a photo confirmation with approval status.
                    </span>
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                }`}
                whileHover={isSubmitting ? {} : { scale: 1.02 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span>Schedule Pickup ✓</span>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
