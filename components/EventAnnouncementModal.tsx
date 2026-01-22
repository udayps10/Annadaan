'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface EventAnnouncementModalProps {
  eventName: string
  eventDate: string
  eventPath: string
  emoji?: string
  description: string
  sessionStorageKey?: string
}

export default function EventAnnouncementModal({
  eventName,
  eventDate,
  eventPath,
  emoji = '🇮🇳',
  description,
  sessionStorageKey = 'hideEventModal'
}: EventAnnouncementModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Always show modal after a short delay for better UX
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
  }

  const handleDonate = () => {
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Header Gradient */}
              <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>

              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white/90 hover:bg-gray-100 rounded-full transition-colors z-10 shadow-md"
                aria-label="Close modal"
              >
                <span className="text-gray-600 text-2xl leading-none">×</span>
              </button>

              {/* Content */}
              <div className="p-5 sm:p-8 text-center pt-8 sm:pt-8">
                {/* Animated Emoji */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4"
                >
                  {emoji}
                </motion.div>

                {/* Event Title */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 px-2 leading-tight">
                  <span className="bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                    {eventName}
                  </span>
                </h2>

                {/* Event Date */}
                <div className="inline-block bg-gradient-to-r from-orange-100 to-green-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">
                    📅 {eventDate}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 px-1">
                  {description}
                </p>

                {/* Impact Stats */}
                <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600">10K+</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">Meals</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">500+</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">Donors</div>
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">15+</div>
                      <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5">Cities</div>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2 sm:space-y-3">
                  <Link href={eventPath} onClick={handleDonate}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-orange-500 to-green-500 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                    >
                      🎁 Donate Now
                    </motion.button>
                  </Link>

                  <button
                    onClick={handleDismiss}
                    className="w-full text-gray-600 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base active:scale-95"
                  >
                    Maybe Later
                  </button>
                </div>

                {/* Fine Print */}
                <p className="text-[10px] sm:text-xs text-gray-400 mt-3 sm:mt-4 leading-relaxed px-2">
                  Your generous contribution will be approved by our admin before being displayed publicly.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
