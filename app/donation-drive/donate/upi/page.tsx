'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 }
}

export default function UPIDonationPage() {
  const router = useRouter()
  const [donorId, setDonorId] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // QR Code generation states
  const [amount, setAmount] = useState<string>('')
  const [qrCode, setQrCode] = useState<string>('')
  const [upiUrl, setUpiUrl] = useState<string>('')
  const [qrAmount, setQrAmount] = useState<number>(0)
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)
  const [qrError, setQrError] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const storedDonorId = sessionStorage.getItem('donorId')
    if (!storedDonorId) {
      router.push('/donation-drive/register')
      return
    }
    setDonorId(storedDonorId)
    
    // Detect mobile device
    const checkMobile = () => {
      const ua = navigator.userAgent
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    }
    setIsMobile(checkMobile())
  }, [router])

  const handleGenerateQR = async () => {
    setQrError('')
    
    const amountNum = parseFloat(amount)
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setQrError('Please enter a valid amount greater than 0')
      return
    }

    if (amountNum > 100000) {
      setQrError('Amount cannot exceed ₹1,00,000')
      return
    }

    setIsGeneratingQR(true)

    try {
      const response = await fetch('/api/generate-upi-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amountNum })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code')
      }

      setQrCode(data.qrCode)
      setUpiUrl(data.upiUrl)
      setQrAmount(data.amount)
      setQrError('')
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'Failed to generate QR code')
    } finally {
      setIsGeneratingQR(false)
    }
  }

  const handleResetQR = () => {
    setAmount('')
    setQrCode('')
    setUpiUrl('')
    setQrAmount(0)
    setQrError('')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshot(reader.result as string)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setError('Failed to read file')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to upload file')
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!screenshot) {
      setError('Please upload a payment screenshot')
      return
    }

    if (!donorId) {
      setError('Donor ID not found. Please register again.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/donation-drive/upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          donorId: parseInt(donorId),
          paymentScreenshot: screenshot,
          amount: qrAmount || parseFloat(amount) || 0
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit donation')
      }

      setSuccess(true)
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/donation-drive/my-donations')
      }, 2000)
    } catch (err) {
      console.error('Submission error:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit donation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!donorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
            Your UPI donation has been submitted successfully. Our admin will review and approve it shortly.
            You'll receive an email receipt once approved.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Redirecting to your donations dashboard...
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-semibold">
                <span className="mr-2 text-xl">💰</span>
                UPI Donation
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Donate via UPI
            </h1>
            <p className="text-lg text-gray-600">
              Scan the QR code, make payment, and upload screenshot
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl p-8"
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📱</span>
                Step 1: Scan & Pay
              </h2>
              
              {/* QR Code Display */}
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-6 mb-6">
                {!qrCode ? (
                  <div className="space-y-4">
                    {/* Amount Input */}
                    <div>
                      <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                        Donation Amount (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="amount"
                        type="number"
                        min="1"
                        max="100000"
                        step="1"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleGenerateQR()
                          }
                        }}
                        disabled={isGeneratingQR}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
                      />
                    </div>

                    {qrError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-600">{qrError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleGenerateQR}
                      disabled={isGeneratingQR}
                      className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                        isGeneratingQR
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {isGeneratingQR ? 'Generating...' : 'Generate QR Code'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* QR Code */}
                    <div className="bg-white rounded-lg p-4 text-center">
                      <img
                        src={qrCode}
                        alt="UPI QR Code"
                        className="w-56 h-56 mx-auto"
                      />
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-blue-600">
                          ₹ {qrAmount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          singhraunak1107@oksbi
                        </p>
                      </div>
                    </div>

                    {/* Open UPI App Button - Prominent on Mobile */}
                    {isMobile && (
                      <a
                        href={upiUrl}
                        className="block w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        📱 Open UPI App
                      </a>
                    )}

                    {/* Desktop: Show button but less prominent */}
                    {!isMobile && (
                      <a
                        href={upiUrl}
                        className="block w-full py-3 border-2 border-green-600 text-green-600 text-center rounded-lg font-semibold hover:bg-green-50 transition-all"
                      >
                        📱 Try Opening UPI App
                      </a>
                    )}

                    {/* Helper Text */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        {isMobile ? (
                          <>
                            <span className="block mb-1">🔹 Tap button to open UPI app with amount pre-filled</span>
                            <span className="block">🔹 Or scan QR code from another device</span>
                          </>
                        ) : (
                          <>
                            <span className="block mb-1">🔹 Scan QR code with your mobile UPI app</span>
                            <span className="block text-gray-400">(UPI deep link works best on mobile)</span>
                          </>
                        )}
                      </p>
                    </div>
                    
                    <button
                      onClick={handleResetQR}
                      className="w-full py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      Change Amount
                    </button>
                  </div>
                )}
              </div>

              {/* UPI Instructions */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">How to pay:</h3>
                  <ol className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="font-bold mr-2 text-blue-600">1.</span>
                      <span>Enter your donation amount above</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2 text-blue-600">2.</span>
                      <span>Click "Generate QR Code"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2 text-blue-600">3.</span>
                      <span>Open any UPI app (GPay, PhonePe, Paytm, etc.)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2 text-blue-600">4.</span>
                      <span>Scan the QR code (amount is pre-filled)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2 text-blue-600">5.</span>
                      <span>Complete the payment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-bold mr-2 text-blue-600">6.</span>
                      <span>Take a screenshot and upload below</span>
                    </li>
                  </ol>
                </div>
              </div>
            </motion.div>

            {/* Upload Section */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl p-8"
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📤</span>
                Step 2: Upload Proof
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  
                  {!screenshot ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-all cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="screenshot-upload"
                        disabled={isUploading}
                      />
                      <label htmlFor="screenshot-upload" className="cursor-pointer">
                        {isUploading ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Uploading...</p>
                          </div>
                        ) : (
                          <>
                            <div className="text-5xl mb-4">📸</div>
                            <p className="text-gray-700 font-semibold mb-2">
                              Click to upload screenshot
                            </p>
                            <p className="text-sm text-gray-500">
                              PNG, JPG up to 5MB
                            </p>
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="border-2 border-green-500 rounded-xl p-4 bg-green-50">
                        <img 
                          src={screenshot} 
                          alt="Payment screenshot" 
                          className="w-full h-64 object-contain rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setScreenshot('')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all"
                      >
                        ✕
                      </button>
                      <p className="text-sm text-green-600 mt-2 flex items-center justify-center">
                        <span className="mr-2">✓</span>
                        Screenshot uploaded successfully
                      </p>
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <motion.div 
                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <p className="text-sm text-red-800 flex items-start">
                      <span className="mr-2 text-lg">❌</span>
                      <span>{error}</span>
                    </p>
                  </motion.div>
                )}

                {/* Info Box */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-gray-700 flex items-start">
                    <span className="mr-2 text-lg">ℹ️</span>
                    <span>
                      Your donation will be reviewed by our admin team. Once approved, 
                      you'll receive an email receipt with donation details.
                    </span>
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !screenshot}
                  className={`w-full py-4 rounded-lg text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl ${
                    isSubmitting || !screenshot
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                  whileHover={isSubmitting || !screenshot ? {} : { scale: 1.02 }}
                  whileTap={isSubmitting || !screenshot ? {} : { scale: 0.98 }}
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
                    <span>Submit Donation ✓</span>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
