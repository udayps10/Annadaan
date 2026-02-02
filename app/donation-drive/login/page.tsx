'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
}

export default function DonorLoginPage() {
  const router = useRouter()
  const [authMethod, setAuthMethod] = useState<'password' | 'aadhaar'>('password')
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    aadhaarLast4: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number'
    }

    // Validate based on auth method
    if (authMethod === 'password') {
      // Password validation
      if (!formData.password) {
        newErrors.password = 'Password is required'
      }
    } else {
      // Aadhaar last 4 digits validation
      if (!formData.aadhaarLast4.trim()) {
        newErrors.aadhaarLast4 = 'Last 4 digits of Aadhaar are required'
      } else if (!/^\d{4}$/.test(formData.aadhaarLast4)) {
        newErrors.aadhaarLast4 = 'Please enter exactly 4 digits'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const requestBody = authMethod === 'password' 
        ? { phone: formData.phone, password: formData.password }
        : { phone: formData.phone, aadhaarLast4: formData.aadhaarLast4 }

      const response = await fetch('/api/donation-drive/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        // Extract error message from nested structure
        const errorMessage = data.error?.message || data.error || data.message || 'Login failed'
        throw new Error(errorMessage)
      }

      // Store donor ID in sessionStorage
      // API returns: { success: true, data: { donorId, fullName, requiresPasswordUpdate, ... }, message: '...' }
      if (data.success && data.data?.donorId) {
        sessionStorage.setItem('donorId', data.data.donorId.toString())
        sessionStorage.setItem('donorName', data.data.fullName)
        
        // Check if user needs to set up password (for Aadhaar login)
        if (data.data.requiresPasswordUpdate) {
          // Redirect to password setup page
          router.push('/donation-drive/setup-password')
          return
        }
      }

      // Redirect to donation options
      router.push('/donation-drive/donate')

    } catch (err) {
      console.error('Login error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
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
                Back
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-green-100 text-orange-800 text-sm font-semibold">
                <span className="mr-2 text-xl">🔐</span>
                Donor Login
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Welcome Back!
            </h1>
            <p className="text-lg text-gray-600">
              Login to view your donations and donate more
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8"
            variants={fadeInUp}
          >
            {/* Authentication Method Toggle */}
            <div className="mb-6">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('password')
                    setErrors({})
                    setSubmitError('')
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    authMethod === 'password'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🔐 Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('aadhaar')
                    setErrors({})
                    setSubmitError('')
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    authMethod === 'aadhaar'
                      ? 'bg-white text-orange-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🆔 Aadhaar (Legacy)
                </button>
              </div>
              {authMethod === 'aadhaar' && (
                <motion.p 
                  className="mt-3 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ⚠️ <strong>Existing users only:</strong> After login, you'll be prompted to set a password for future logins.
                </motion.p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-all ${
                    errors.phone
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 flex items-start">
                    <span className="mr-1">⚠️</span>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Conditional Fields Based on Auth Method */}
              {authMethod === 'password' ? (
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-all pr-12 ${
                        errors.password
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-300 focus:border-green-500 focus:ring-green-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-600 flex items-start">
                      <span className="mr-1">⚠️</span>
                      {errors.password}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label htmlFor="aadhaarLast4" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last 4 Digits of Aadhaar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="aadhaarLast4"
                    name="aadhaarLast4"
                    value={formData.aadhaarLast4}
                    onChange={handleInputChange}
                    maxLength={4}
                    placeholder="XXXX"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-offset-2 outline-none transition-all ${
                      errors.aadhaarLast4
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:border-orange-500 focus:ring-orange-200'
                    }`}
                  />
                  {errors.aadhaarLast4 && (
                    <p className="mt-2 text-sm text-red-600 flex items-start">
                      <span className="mr-1">⚠️</span>
                      {errors.aadhaarLast4}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    For security, enter only the last 4 digits of your Aadhaar number
                  </p>
                </div>
              )}

              {/* Error Display */}
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

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-lg text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700'
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
                    Logging in...
                  </span>
                ) : (
                  <span>Login 🚀</span>
                )}
              </motion.button>

              {/* Register Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  New donor?{' '}
                  <Link 
                    href="/donation-drive/register" 
                    className="font-semibold text-green-600 hover:text-green-700 transition-colors"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>

          {/* Security Notice */}
          <motion.div 
            className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200"
            variants={fadeInUp}
          >
            <p className="text-xs text-gray-600 flex items-start">
              <span className="mr-2 text-lg">🔒</span>
              <span>
                Your data is secure. We use your phone number and Aadhaar last 4 digits 
                for verification purposes only.
              </span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
