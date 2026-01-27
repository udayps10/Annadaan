'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import Lightbox from 'yet-another-react-lightbox'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import 'yet-another-react-lightbox/styles.css'

// Mock data structure - replace with actual API calls
const eventData = {
  hero: {
    title: 'Republic Day 2026',
    subtitle: 'Impact & Transparency Report',
    description: 'This page documents how your contributions were used.',
    date: 'January 26, 2026',
    location: 'Multiple Cities Across India'
  },
  recap: {
    description: 'On January 26, 2026, Annadaan mobilized communities across India to celebrate Republic Day by serving those in need. Through collective effort and transparent operations, we transformed donations into dignified meals for families facing food insecurity. This report documents every step of that journey.',
    highlights: [
      { label: 'Event Date', value: 'January 26, 2026' },
      { label: 'Duration', value: '24-hour drive' },
      { label: 'Locations', value: 'Mumbai' },
      { label: 'Volunteers', value: '7 active participants' }
    ]
  },
  impact: {
    totalFunds: 7174,
    mealsDistributed: 150,
    volunteersEngaged: 5,
    familiesReached: 150
  },
 fundUtilization: [
  { 
    category: 'Food & Raw Materials', 
    amount: 2250, // Total of Pilot Launch (1800) + Nutritional Staples (450)
    purpose: 'Community meal distribution and nutritional staples for pilot launch' 
  },
  { 
    category: 'Logistics & Documentation', 
    amount: 370, // Total of Documentation/Xerox (280) + Admin Supplies (90)
    purpose: 'Logistics coordination, administrative documentation, and pilot Xerox requirements' 
  },
  { 
    category: 'Packaging & Distribution', 
    amount: 200, // Total of Box (10) + Packing Plastic/Tape (190)
    purpose: 'Secure food-grade containment and reinforcement packaging materials' 
  },
  { 
    category: 'Digital Infrastructure', 
    amount: 40, 
    purpose: 'Domain registration and maintenance for platform accessibility' 
  }
],
  media: {
    photos: [
      { src: '/images/img-1.jpg', alt: 'Meal distribution in progress', type: 'image' },
      { src: '/images/img-2.png', alt: 'Volunteers preparing food', type: 'image' },
      { src: '/images/img-3.png', alt: 'Community gathering', type: 'image' },
      { src: '/images/img-5.png', alt: 'Families receiving meals', type: 'image' }
    ],
    videos: {
      landscape: [
        { src: '/videos/compressed/vid-3.mp4', title: 'Event Highlights' },
        { src: '/videos/compressed/vid-4.mp4', title: 'Food Distribution' }
      ],
      portrait: [
        { src: '/videos/compressed/vid-1.mp4', title: 'Volunteer Stories' },
        { src: '/videos/compressed/vid-2.mp4', title: 'Community Impact' }
      ]
    }
  },
  testimonial: {
    name: 'Beneficiary',
    role: 'Community Member',
    quote: 'Apsab log hamari madat kar rahe hai hamesha aise hi acha rakhega apko bhagwan aise hi karte raho',
    videoSrc: '/videos/compressed/vid-5.mp4'
  },
transactions: [
  { 
    id: 'EXP-1', 
    date: '2025-01-24', 
    vendor: 'Standardized Meal Units', 
    amount: 1800, 
    category: 'FOOD DRIVE', 
    receipt: '/receipts/rec-1.png' 
  },
  { 
    id: 'EXP-2', 
    date: '2025-01-25', 
    vendor: 'Domain Registration & Maintenance', 
    amount: 40, 
    category: 'Operational Costs', 
    receipt: '' 
  },
  { 
    id: 'EXP-3', 
    date: '2025-01-25', 
    vendor: 'Distribution Supplies & Goods', 
    amount: 450, 
    category: 'FOOD DRIVE', 
    receipt: '/receipts/rec-3.png' 
  },
  { 
    id: 'EXP-4', 
    date: '2025-01-25', 
    vendor: 'Documentation & Logistics Materials', 
    amount: 280, 
    category: 'FOOD DRIVE', 
    receipt: '/receipts/rec-2.png' 
  },
  { 
    id: 'EXP-5', 
    date: '2025-01-26', 
    vendor: 'Administrative & Packaging Supplies', 
    amount: 90, 
    category: 'FOOD DRIVE', 
    receipt: '' 
  },
  { 
    id: 'EXP-6', 
    date: '2025-01-26', 
    vendor: 'Storage & Containment Solutions', 
    amount: 10, 
    category: 'FOOD DRIVE', 
    receipt: '' 
  },
  { 
    id: 'EXP-7', 
    date: '2025-01-26', 
    vendor: 'Packaging & Reinforcement Materials', 
    amount: 190, 
    category: 'FOOD DRIVE', 
    receipt: '' 
  }
]
}

// Counter animation component
function Counter({ end, duration = 2, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  
  useEffect(() => {
    if (!isInView) return
    
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
      
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [isInView, end, duration])
  
  return <div ref={ref}>{prefix}{count.toLocaleString()}{suffix}</div>
}

export default function RepublicDay2026() {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
  
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  
  const openReceipt = (receiptUrl: string) => {
    setSelectedReceipt(receiptUrl)
    setReceiptModalOpen(true)
  }

  // Reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false

  const fadeInUp = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back to Annadaan</span>
            </Link>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Event:</span>
              <span className="text-sm font-semibold text-green-600">Republic Day 2026</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <motion.section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        {/* Background with animated gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-orange-100 via-green-50 to-emerald-100"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        
        {/* Content */}
        <motion.div 
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          <motion.div
            className="text-7xl mb-6"
            variants={fadeInUp}
            animate={{
              y: [0, -10, 0],
              rotate: [-5, 5, -5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🇮🇳
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 leading-tight"
            variants={fadeInUp}
          >
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Republic Day 2026
            </span>
            <br />
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Impact Report
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            {eventData.hero.description}
          </motion.p>
          
          <motion.div 
            className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-green-200"
            variants={fadeInUp}
          >
            <span className="text-sm text-gray-600">📅 {eventData.hero.date}</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-600">📍 {eventData.hero.location}</span>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center space-y-4 mt-12"
            variants={fadeInUp}
          >
            <p className="text-sm text-gray-500">Scroll to explore the impact</p>
            <motion.svg 
              className="w-6 h-6 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </motion.svg>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Main Content Container */}
      <div className="bg-white">
        
        {/* 2. EVENT RECAP */}
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 py-24 md:py-32">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
            >
              <motion.div 
                className="flex items-center justify-center mb-6"
                variants={fadeInUp}
              >
                <span className="text-5xl mr-4">📖</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  What Happened
                </h2>
              </motion.div>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-700 leading-relaxed mb-16 text-center max-w-4xl mx-auto"
                variants={fadeInUp}
              >
                {eventData.recap.description}
              </motion.p>
              
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
                variants={fadeInUp}
              >
                {eventData.recap.highlights.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 hover:border-green-400 transition-colors hover:shadow-lg"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="text-sm text-green-600 font-semibold mb-2">{item.label}</p>
                    <p className="text-lg font-bold text-gray-900">{item.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </section>
        </RevealSection>

        {/* 3. TESTIMONIAL SECTION - VOICE OF IMPACT */}
        <RevealSection>
          <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 py-24 md:py-32 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '50px 50px' }} />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 relative z-10">
              <motion.div
                className="text-center mb-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <motion.div
                  className="text-center mb-16"
                  variants={fadeInUp}
                >
                  <span className="text-5xl mb-4 block">💬</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Voice of Impact
                  </h2>
                  <p className="text-white/90">Hear directly from those we serve</p>
                </motion.div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Testimonial Video - Portrait */}
                <motion.div
                  className="order-2 lg:order-1 flex justify-center"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="relative aspect-[9/16] w-full max-w-sm bg-black rounded-2xl overflow-hidden shadow-2xl">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      <source src={eventData.testimonial.videoSrc} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </motion.div>

                {/* Quote & Impact Statement */}
                <motion.div
                  className="order-1 lg:order-2 text-white"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="mb-6 lg:mb-8">
                    <svg className="w-10 h-10 lg:w-12 lg:h-12 text-white/30 mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                    <p className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed mb-4 lg:mb-6 italic">
                      &quot;{eventData.testimonial.quote}&quot;
                    </p>
                    <div className="border-l-4 border-white/50 pl-4">
                      <p className="font-semibold text-base lg:text-lg">{eventData.testimonial.name}</p>
                      <p className="text-white/80 text-sm">{eventData.testimonial.role}</p>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-white/20">
                    <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 flex items-center gap-2">
                      <span>🌟</span> Our Commitment to Impact
                    </h3>
                    <p className="text-white/90 leading-relaxed text-sm lg:text-base">
                      Through Republic Day 2026, we reached <strong>150+ families</strong> with <strong>150+ meals</strong>, 
                      demonstrating our unwavering commitment to fighting food insecurity. Every contribution is tracked, 
                      every receipt published, and every impact measured—because transparency builds trust, 
                      and trust enables transformation.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* 3A. PORTRAIT MEDIA SHOWCASE */}
        <RevealSection>
          <section className="bg-gradient-to-br from-orange-50 via-green-50 to-emerald-50 py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
              <motion.div
                className="text-center mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <span className="text-5xl mb-4 block">📸</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Visual Documentation
                </h2>
                <p className="text-gray-600">Capturing moments that made a difference</p>
              </motion.div>
              
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 }
                }}
                className="portrait-gallery"
              >
                {eventData.media.photos.map((photo, index) => (
                  <SwiperSlide key={index}>
                    <motion.div
                      className="relative aspect-[3/4] bg-white rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-shadow"
                      onClick={() => openLightbox(index)}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.02, y: -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={{ scale: 0 }}
                          whileHover={{ scale: 1 }}
                        >
                          <div className="bg-white/90 rounded-full p-3">
                            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>
        </RevealSection>

        {/* 3B. VIDEO GALLERY */}
        <RevealSection>
          <section className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-4">
              <motion.div
                className="text-center mb-16"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <motion.div
                  className="text-center mb-16"
                  variants={fadeInUp}
                >
                  <span className="text-5xl mb-4 block">🎥</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Video Highlights
                  </h2>
                  <p className="text-gray-600">Moments captured in motion</p>
                </motion.div>
              </motion.div>

              {/* Landscape Videos */}
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Event Coverage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {eventData.media.videos.landscape.map((video, index) => (
                    <motion.div
                      key={index}
                      className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <video
                        className="w-full h-full object-cover"
                        controls
                        muted
                        preload="metadata"
                      >
                        <source src={video.src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white font-medium">{video.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Portrait Videos */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Stories & Moments</h3>
                <div className="flex justify-center gap-6">
                  {eventData.media.videos.portrait.map((video, index) => (
                    <motion.div
                      key={index}
                      className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <video
                        className="w-full h-full object-cover"
                        controls
                        muted
                        preload="metadata"
                      >
                        <source src={video.src} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p className="text-white text-sm font-medium">{video.title}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </RevealSection>

        {/* 4. IMPACT STATISTICS */}
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 py-24 md:py-32">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.div 
                className="text-center mb-16"
                variants={fadeInUp}
              >
                <span className="text-5xl mb-4 block">📊</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Impact By the Numbers
                </h2>
                <p className="text-gray-600">Measurable results from your generosity</p>
              </motion.div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                <motion.div 
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-center border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                    <Counter end={eventData.impact.totalFunds} prefix="₹" />
                  </div>
                  <p className="text-sm md:text-base text-gray-700 font-medium">Total Funds Raised</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 text-center border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent mb-2">
                    <Counter end={eventData.impact.mealsDistributed} />
                  </div>
                  <p className="text-sm md:text-base text-gray-700 font-medium">Meals Distributed</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 text-center border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
                    <Counter end={eventData.impact.volunteersEngaged} />
                  </div>
                  <p className="text-sm md:text-base text-gray-700 font-medium">Volunteers</p>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 text-center border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow"
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mb-2">
                    <Counter end={eventData.impact.familiesReached} />
                  </div>
                  <p className="text-sm md:text-base text-gray-700 font-medium">Families Reached</p>
                </motion.div>
              </div>
            </motion.div>
          </section>
        </RevealSection>

        {/* 5. FUND UTILIZATION BREAKDOWN */}
        <RevealSection>
          <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 py-24 md:py-32">
            <div className="max-w-6xl mx-auto px-4">
              <motion.div
                className="text-center mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <span className="text-5xl mb-4 block">💰</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  How Funds Were Used
                </h2>
                <p className="text-gray-600">Complete transparency in every rupee spent</p>
              </motion.div>
              
              <motion.div 
                className="space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                {eventData.fundUtilization.map((item, index) => (
                  <motion.div
                    key={index}
                    className="bg-white border-2 border-green-200 rounded-2xl p-6 hover:border-green-400 hover:shadow-lg transition-all"
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, y: -3 }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-neutral-900 mb-1">
                          {item.category}
                        </h3>
                        <p className="text-sm text-neutral-600">{item.purpose}</p>
                      </div>
                      <div className="text-2xl font-light text-neutral-900 md:text-right">
                        ₹{item.amount.toLocaleString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div 
                  className="bg-neutral-900 text-white rounded-lg p-6 mt-6"
                  variants={fadeInUp}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Expenditure</span>
                    <span className="text-2xl font-light">
                      ₹{eventData.fundUtilization.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 mt-6"
                  variants={fadeInUp}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">Remaining Funds & Future Use</h4>
                      <p className="text-gray-700 leading-relaxed">
                        Any remaining funds collected for this event will be allocated to future community service initiatives, 
                        upcoming food drives, and operational expenses to sustain our mission. We maintain complete transparency 
                        in all fund utilization and will provide detailed reports for all subsequent events and services.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </RevealSection>

        {/* 6. TRANSACTION TRANSPARENCY */}
        <RevealSection>
          <section className="max-w-5xl mx-auto px-4 py-24 md:py-32">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              <motion.div 
                className="text-center mb-12"
                variants={fadeInUp}
              >
                <span className="text-5xl mb-4 block">📄</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Verified Transactions
                </h2>
                <p className="text-gray-600">
                  All receipts and invoices are available for review. Personal details have been redacted for privacy.
                </p>
              </motion.div>
              
              <motion.div className="space-y-3" variants={fadeInUp}>
                {eventData.transactions.map((txn, index) => (
                  <motion.div
                    key={txn.id}
                    className="bg-white border border-neutral-200 rounded-lg p-5 hover:border-neutral-300 transition-colors"
                    variants={fadeInUp}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-xs font-mono text-neutral-500">{txn.id}</span>
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="text-xs text-neutral-500">{txn.date}</span>
                        </div>
                        <h3 className="text-base font-medium text-neutral-900 mb-1">
                          {txn.vendor}
                        </h3>
                        <p className="text-sm text-neutral-600">{txn.category}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-lg font-medium text-neutral-900">
                          ₹{txn.amount.toLocaleString()}
                        </span>
                        {txn.receipt && (
                          <button
                            onClick={() => openReceipt(txn.receipt)}
                            className="text-sm text-neutral-600 hover:text-neutral-900 underline underline-offset-2 transition-colors"
                          >
                            View Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </section>
        </RevealSection>

        {/* 6.5. OUR GENEROUS CONTRIBUTORS */}
        <RevealSection>
          <section className="max-w-6xl mx-auto px-4 py-24 md:py-32 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              <motion.div 
                className="text-center mb-16"
                variants={fadeInUp}
              >
                <span className="text-5xl mb-4 block">🙏</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Generous Contributors
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Every contribution, big or small, made a real difference. We are deeply grateful to all our donors who made this event possible.
                </p>
              </motion.div>
              
              {/* UPI Donations */}
              <motion.div className="mb-12" variants={fadeInUp}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">💰</span>
                  <span>Monetary Contributions</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Rishit</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹560</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Uday</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹200</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Ashmit Singh</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹360</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Aaryan Ajay Yadav</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹11</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Krrishi Sisodiya</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹11</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Nis</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹15</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Vedant Mehta</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹11</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">NILESH HATE</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹1001</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Poonam Singh</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹1001</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Pravin Pereira</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹1000</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Prabhakar Singh</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹500</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Tanishka Desai</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹51</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Kenil</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹151</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Aryan Yadav</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹500</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Vasanthi m</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹20</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Aryan Singh</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹11</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Arpit Singh</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹360</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Raunak Singh</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹360</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Gayatri Magi</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹500</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Vikas Singh</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹501</p>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">Anonymous</p>
                      </div>
                      <p className="text-xl font-bold text-green-600">₹50</p>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-6 mt-6 shadow-lg"
                  variants={fadeInUp}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold">Total Monetary Contributions</span>
                    <span className="text-3xl font-bold">₹7,174</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Item Donations */}
              <motion.div variants={fadeInUp}>
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-3xl">📦</span>
                  <span>Item Contributions</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Sakshi Singh</p>
                        <div className="bg-blue-50 rounded-lg p-3 mt-2">
                          <p className="text-sm font-medium text-blue-900">500g Poha,500g Puffed Rice, 3kg Rice</p>
                          <p className="text-xs text-blue-700 mt-1">Quantity: 3</p>
                        </div>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Mahek singh</p>
                        <div className="bg-blue-50 rounded-lg p-3 mt-2">
                          <p className="text-sm font-medium text-blue-900">5kg rice</p>
                          <p className="text-xs text-blue-700 mt-1">Quantity: 1</p>
                        </div>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Poonam Singh</p>
                        <div className="bg-blue-50 rounded-lg p-3 mt-2">
                          <p className="text-sm font-medium text-blue-900">Used clothes, Rice - 2 kgs, Dal - 2 kgs</p>
                          <p className="text-xs text-blue-700 mt-1">Quantity: 3</p>
                        </div>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Loukik Salvi</p>
                        <div className="bg-blue-50 rounded-lg p-3 mt-2">
                          <p className="text-sm font-medium text-blue-900">Rice, Soya Bean</p>
                          <p className="text-xs text-blue-700 mt-1">Quantity: 2</p>
                        </div>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeInUp} className="bg-white rounded-lg p-5 border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 mb-1">Anonymous</p>
                        <div className="bg-blue-50 rounded-lg p-3 mt-2">
                          <p className="text-sm font-medium text-blue-900">1kg aata, packet of jaggery, packet of laddos</p>
                          <p className="text-xs text-blue-700 mt-1">Quantity: 3</p>
                        </div>
                      </div>
                      <span className="text-2xl">✅</span>
                    </div>
                  </motion.div>

                  
                </div>

                <motion.div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mt-6 shadow-lg"
                  variants={fadeInUp}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold">Total Item Donations</span>
                    <span className="text-3xl font-bold">5 Contributors</span>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </section>
        </RevealSection>

        {/* 7. CLOSING STATEMENT */}
        <RevealSection>
          <section className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-600 text-white py-32 md:py-40 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '50px 50px' }} />
            </div>
            <motion.div
              className="max-w-3xl mx-auto px-4 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.2
                  }
                }
              }}
            >
              <motion.h2 
                className="text-3xl md:text-5xl font-light mb-6"
                variants={fadeInUp}
              >
                Thank You for Making This Possible
              </motion.h2>
              
              <motion.p 
                className="text-lg md:text-xl text-neutral-400 mb-12"
                variants={fadeInUp}
              >
                This event was made possible through the generosity of donors and the dedication of volunteers. 
                Your trust in our mission drives everything we do.
              </motion.p>
              
              <motion.div variants={fadeInUp}>
                <Link 
                  href="/"
                  className="inline-block text-sm text-white/70 hover:text-white border-b border-white/30 hover:border-white pb-1 transition-colors"
                >
                  Learn more about Annadaan's mission →
                </Link>
              </motion.div>
            </motion.div>
          </section>
        </RevealSection>

      </div>

      {/* Lightbox for Media */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={eventData.media.photos.map(photo => ({
          src: photo.src,
          alt: photo.alt
        }))}
      />

      {/* Receipt Modal */}
      <AnimatePresence>
        {receiptModalOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReceiptModalOpen(false)}
          >
            <motion.div
              className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-neutral-900">Transaction Receipt</h3>
                <button
                  onClick={() => setReceiptModalOpen(false)}
                  className="text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {selectedReceipt && (
                  <div className="relative w-full">
                    <Image
                      src={selectedReceipt}
                      alt="Transaction Receipt"
                      width={800}
                      height={1067}
                      className="w-full h-auto rounded"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Utility component for scroll-triggered reveals
function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <div ref={ref}>
      {children}
    </div>
  )
}
