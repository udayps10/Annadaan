'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
}

export default function SetupPasswordPage() {
  const router = useRouter()
  const [donorId, setDonorId] = useState<string | null>(null)
  const [donorName, setDonorName] = useState<string>('')
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // Check if donor is logged in
    const storedDonorId = sessionStorage.getItem('donorId')
    const storedDonorName = sessionStorage.getItem('donorName')
    
    if (!storedDonorId) {
      // Redirect to login if not authenticated
      router.push('/donation-drive/login')
      return
    }
    
    setDonorId(storedDonorId)
    setDonorName(storedDonorName || '')
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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

    if (!donorId) {
      setSubmitError('Session expired. Please login again.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/donation-drive/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId: parseInt(donorId),
          password: formData.password,
          confirmPassword: formData.confirmPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error?.message || data.error || data.message || 'Failed to set password'
        throw new Error(errorMessage)
      }

      // Success - redirect to donation page
      router.push('/donation-drive/donate')

    } catch (err) {
      console.error('Setup password error:', err)
      setSubmitError(err instanceof Error ? err.message : 'Failed to set password. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking authentication
  if (!donorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
                Security Setup Required
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Set Your Password
            </h1>
            {donorName && (
              <p className="text-lg text-gray-600 mb-2">
                Welcome back, <span className="font-semibold text-green-700">{donorName}</span>!
              </p>
            )}
            <p className="text-base text-gray-600">
              For enhanced security, please create a password for your account. You'll use this password for future logins instead of Aadhaar.
            </p>
          </motion.div>

          {/* Setup Form */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8"
            variants={fadeInUp}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none pr-12`}
                    placeholder="Create a strong password"
                    disabled={isSubmitting}
                    autoFocus
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
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.password}
                  </motion.p>
                )}
                <div className="mt-2 space-y-1">
                  <p className={`text-xs flex items-center ${
                    formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span className="mr-1">{formData.password.length >= 8 ? '✓' : '○'}</span>
                    At least 8 characters
                  </p>
                  <p className={`text-xs flex items-center ${
                    /(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span className="mr-1">{/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? '✓' : '○'}</span>
                    Uppercase and lowercase letters
                  </p>
                  <p className={`text-xs flex items-center ${
                    /(?=.*\d)/.test(formData.password) ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    <span className="mr-1">{/(?=.*\d)/.test(formData.password) ? '✓' : '○'}</span>
                    At least one number
                  </p>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                    } focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none pr-12`}
                    placeholder="Re-enter your password"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p 
                    className="mt-2 text-sm text-red-600 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <span className="mr-1">⚠️</span> {errors.confirmPassword}
                  </motion.p>
                )}
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

              {/* Info Notice */}
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
                variants={fadeInUp}
              >
                <p className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2 text-lg">ℹ️</span>
                  <span>
                    Once you set your password, you'll no longer need your Aadhaar details to log in. 
                    Just use your phone number and this password.
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
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
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
                    Setting Password...
                  </span>
                ) : (
                  <span>Set Password & Continue →</span>
                )}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
