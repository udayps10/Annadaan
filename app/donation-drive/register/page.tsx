'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
}

export default function DonorRegistrationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    aadhaarNumber: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters'
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'Name should only contain letters and spaces'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Aadhaar validation
    if (!formData.aadhaarNumber.trim()) {
      newErrors.aadhaarNumber = 'Aadhaar number is required'
    } else if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Aadhaar number must be exactly 12 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
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

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/donation-drive/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const response_data = await response.json()

      if (!response.ok) {
        throw new Error(response_data.error || response_data.message || 'Registration failed')
      }

      // Extract data from standardized API response format
      const data = response_data.success ? response_data.data : response_data

      // Store donor ID in sessionStorage for donation flow
      if (data.donorId) {
        sessionStorage.setItem('donorId', data.donorId.toString())
      }

      // Success - redirect to donation page
      router.push('/donation-drive/donate')
    } catch (error) {
      console.error('Registration error:', error)
      setSubmitError(error instanceof Error ? error.message : 'Failed to register. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
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
                href="/donation-drive" 
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center group"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform">←</span>
                Back to Event
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                <span className="mr-2 text-xl">📝</span>
                Step 1 of 2
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Register as a Donor
            </h1>
            <p className="text-lg text-gray-600">
              Join our Republic Day Donation Drive by filling this simple form
            </p>
          </motion.div>

          {/* Registration Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 lg:p-10"
            variants={fadeInUp}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none`}
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
                />
                {errors.fullName && (
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.fullName}
                  </motion.p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none`}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  disabled={isSubmitting}
                />
                {errors.phone && (
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.phone}
                  </motion.p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none`}
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.email}
                  </motion.p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  📧 You'll receive donation receipts on this email
                </p>
              </div>

              {/* Aadhaar Number */}
              <div>
                <label htmlFor="aadhaarNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Aadhaar Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="aadhaarNumber"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.aadhaarNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                  } focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none`}
                  placeholder="12-digit Aadhaar number"
                  maxLength={12}
                  disabled={isSubmitting}
                />
                {errors.aadhaarNumber && (
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.aadhaarNumber}
                  </motion.p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  🔒 Your Aadhaar information is kept confidential and secure
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

              {/* Privacy Notice */}
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
                variants={fadeInUp}
              >
                <p className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2 text-lg">ℹ️</span>
                  <span>
                    By registering, you agree that your information will be used solely for the 
                    purpose of this donation drive. We respect your privacy and will never share 
                    your personal details with third parties.
                  </span>
                </p>
              </motion.div>

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
                    Registering...
                  </span>
                ) : (
                  <span>Continue to Donation →</span>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Login Link */}
          <motion.div 
            className="mt-6 text-center"
            variants={fadeInUp}
          >
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <p className="text-gray-600 mb-3">
                Already registered as a donor?
              </p>
              <Link 
                href="/donation-drive/login" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
              >
                <span className="mr-2">🔐</span>
                Login Here
              </Link>
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div 
            className="mt-6 text-center"
            variants={fadeInUp}
          >
            <p className="text-gray-600 text-sm">
              Need help? Contact us at{' '}
              <a href="mailto:support@annadaan.org" className="text-orange-600 hover:text-orange-700 font-semibold">
                support@annadaan.org
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
