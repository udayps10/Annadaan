'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface TermsModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline: () => void
}

const termsContent = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: '✅',
    content: 'By registering for Annadaan, you accept and agree to be bound by these terms and conditions. Your use of our platform constitutes acceptance of this agreement.'
  },
  {
    id: 'responsibilities',
    title: 'User Responsibilities',
    icon: '👤',
    content: 'Food providers must ensure all listed food is safe for consumption. NGOs must have proper authorization. All users must provide accurate information and maintain reliable communication.'
  },
  {
    id: 'food-safety',
    title: 'Food Safety',
    icon: '🛡️',
    content: 'Food providers are solely responsible for food safety and quality. All food must meet health standards and be properly stored. Expired or unsafe food must not be listed.'
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    icon: '⚖️',
    content: 'Annadaan acts as a facilitating platform only. We are not responsible for food quality, safety, or condition. Users engage in food exchange at their own risk.'
  },
  {
    id: 'privacy',
    title: 'Privacy & Data',
    icon: '🔒',
    content: 'We collect only necessary information for food rescue operations. Your data is protected according to applicable laws and will not be shared without consent.'
  }
]

export default function TermsModal({ isOpen, onAccept, onDecline }: TermsModalProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true)
    }
  }

  const nextSection = () => {
    if (currentSection < termsContent.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      setHasScrolledToBottom(true)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false)
      setCurrentSection(0)
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDecline}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Terms & Conditions</h2>
                    <p className="text-green-100">Please review before continuing</p>
                  </div>
                </div>
                <button
                  onClick={onDecline}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-gray-100 px-6 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Section {currentSection + 1} of {termsContent.length}</span>
                <Link 
                  href="/terms" 
                  target="_blank"
                  className="text-sm text-green-600 hover:text-green-700 underline"
                >
                  View Full Terms
                </Link>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentSection + 1) / termsContent.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[50vh] overflow-y-auto" onScroll={handleScroll}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Current Section */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{termsContent[currentSection].icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          {termsContent[currentSection].title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">
                          {termsContent[currentSection].content}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Key Points */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">Key Points:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: '🔒', text: 'Your data is secure and protected' },
                        { icon: '🤝', text: 'Platform facilitates connections only' },
                        { icon: '⚡', text: 'Real-time matching and notifications' },
                        { icon: '🌟', text: 'Community-driven impact tracking' }
                      ].map((point, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-100"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <span className="text-xl">{point.icon}</span>
                          <span className="text-sm text-gray-600">{point.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  ← Previous
                </button>

                <div className="flex space-x-2">
                  {termsContent.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSection(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentSection
                          ? 'bg-green-600'
                          : index <= currentSection
                          ? 'bg-green-300'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentSection < termsContent.length - 1 ? (
                  <button
                    onClick={nextSection}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => setHasScrolledToBottom(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Review Complete ✓
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className={hasScrolledToBottom ? 'text-green-600' : ''}>
                    {hasScrolledToBottom ? '✓' : '•'}
                  </span>
                  <span>
                    {hasScrolledToBottom 
                      ? 'Terms reviewed - you can now accept' 
                      : 'Please review all sections to continue'
                    }
                  </span>
                </div>
                <div className="flex space-x-3">
                  <motion.button
                    onClick={onDecline}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Decline
                  </motion.button>
                  <motion.button
                    onClick={onAccept}
                    disabled={!hasScrolledToBottom}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      hasScrolledToBottom
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    whileHover={hasScrolledToBottom ? { scale: 1.02 } : {}}
                    whileTap={hasScrolledToBottom ? { scale: 0.98 } : {}}
                  >
                    {hasScrolledToBottom ? 'Accept & Continue' : 'Review All Sections'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
