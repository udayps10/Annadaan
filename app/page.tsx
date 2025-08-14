'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95 }
}

export default function HomePage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  
  const [ref1, inView1] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ref2, inView2] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ref3, inView3] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ref4, inView4] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <div className="min-h-screen overflow-x-hidden">
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
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  🍽️ Annadaan
                </h1>
              </div>
            </motion.div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {['Features', 'How It Works', 'About'].map((item, index) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {item}
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                  </motion.a>
                ))}
                <motion.a
                  href="/gallery"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors relative group"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Gallery
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></span>
                </motion.a>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link href="/login" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/register" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl ml-3">
                    Get Started
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-green-200 rounded-full blur-xl opacity-60"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-32 h-32 bg-emerald-200 rounded-full blur-xl opacity-40"
          animate={{ 
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1 
                className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Sharing Good Food,{' '}
                <motion.span 
                  className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0%', '100%', '0%']
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  One Meal at a Time
                </motion.span>
              </motion.h1>
              
              <motion.p 
                className="mt-6 text-xl text-gray-600 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Connect surplus food from restaurants, hotels, and caterers with NGOs and shelters. 
                Together, we can transform waste into hope and ensure no good meal goes to waste.
              </motion.p>
              
              <motion.div 
                className="mt-8 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register?type=vendor" className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl text-center block relative overflow-hidden">
                    <span className="relative z-10">🏪 I'm a Food Provider</span>
                    <motion.div
                      className="absolute inset-0 bg-white opacity-20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/register?type=ngo" className="group border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-50 transition-all text-center block relative overflow-hidden">
                    <span className="relative z-10">🏠 I'm an NGO/Shelter</span>
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="mt-8 flex items-center space-x-8 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                {[
                  { icon: '🍽️', text: '1M+ Meals Rescued' },
                  { icon: '🌍', text: '500+ Partners' },
                  { icon: '📍', text: '50+ Cities' }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                  >
                    <span className="mr-2 text-lg">{stat.icon}</span>
                    <span>{stat.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="mt-12 lg:mt-0"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{ y: y1 }}
            >
              <div className="relative">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl"
                  animate={{ rotate: [0, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative bg-white p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
                  <motion.div 
                    className="grid grid-cols-2 gap-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    {[
                      { emoji: '🍕', label: 'Restaurant', color: 'orange' },
                      { emoji: '🏠', label: 'Shelter', color: 'blue' },
                      { emoji: '🚚', label: 'Pickup', color: 'green' },
                      { emoji: '❤️', label: 'Impact', color: 'purple' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className={`bg-${item.color}-100 p-4 rounded-lg cursor-pointer`}
                        variants={fadeInUp}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className={`text-2xl font-bold text-${item.color}-600 mb-2`}>{item.emoji}</div>
                        <div className="text-sm text-gray-600">{item.label}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section with Animation */}
      <motion.section 
        ref={ref1}
        className="py-16 bg-white/80 backdrop-blur-sm relative overflow-hidden"
      >
        {/* Floating Background Elements */}
        <motion.div 
          className="absolute top-0 left-1/4 w-40 h-40 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full blur-3xl opacity-30"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={inView1 ? "animate" : "initial"}
          >
            {[
              { number: "1.2M+", label: "Meals Rescued", icon: "🍽️", color: "green" },
              { number: "2.4K", label: "Tons CO₂ Saved", icon: "🌱", color: "emerald" },
              { number: "500+", label: "Active Partners", icon: "🤝", color: "blue" },
              { number: "50+", label: "Cities Covered", icon: "🏙️", color: "purple" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center group cursor-pointer"
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative">
                  <motion.div 
                    className={`w-20 h-20 bg-gradient-to-r from-${stat.color}-100 to-${stat.color}-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-2xl">{stat.icon}</span>
                  </motion.div>
                  <motion.div 
                    className={`text-4xl font-bold text-${stat.color}-600 mb-2`}
                    initial={{ scale: 0 }}
                    animate={inView1 ? { scale: 1 } : { scale: 0 }}
                    transition={{ delay: index * 0.2 + 0.5, type: "spring", stiffness: 100 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section with Enhanced Animations */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
        <motion.div 
          className="absolute top-20 right-10 w-32 h-32 bg-green-200 rounded-full blur-2xl opacity-40"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            ref={ref2}
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={inView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, efficient, and impactful - transforming surplus food into hope
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="initial"
            animate={inView2 ? "animate" : "initial"}
          >
            {[
              {
                icon: "📝",
                title: "Share Available Food",
                description: "Food providers easily list their surplus food with details about quantity, type, and pickup times through our intuitive platform.",
                color: "blue",
                step: "01"
              },
              {
                icon: "🔗",
                title: "Smart Matching",
                description: "Our AI-powered platform intelligently matches available food with nearby NGOs and shelters based on location, capacity, and dietary requirements.",
                color: "green",
                step: "02"
              },
              {
                icon: "🚚",
                title: "Seamless Pickup",
                description: "Coordinated pickup by volunteers or NGO staff with real-time tracking and confirmation to ensure efficient food rescue operations.",
                color: "purple",
                step: "03"
              }
            ].map((step, index) => (
              <motion.div 
                key={index}
                className="relative group"
                variants={fadeInUp}
              >
                <div className="text-center relative">
                  {/* Step Number */}
                  <motion.div 
                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={inView2 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                    transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
                  >
                    {step.step}
                  </motion.div>
                  
                  {/* Icon Container */}
                  <motion.div 
                    className={`w-20 h-20 bg-gradient-to-r from-${step.color}-100 to-${step.color}-200 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-xl transition-all duration-300`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <span className="text-3xl">{step.icon}</span>
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {/* Connection Line */}
                {index < 2 && (
                  <motion.div 
                    className="hidden md:block absolute top-10 left-full w-12 h-0.5 bg-gradient-to-r from-green-300 to-emerald-300"
                    initial={{ scaleX: 0 }}
                    animate={inView2 ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ delay: index * 0.3 + 1 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Platform Features</h2>
            <p className="mt-4 text-xl text-gray-600">Everything you need to make food rescue efficient</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">�</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Responsive Design</h3>
              <p className="text-gray-600">Modern responsive web interface that works seamlessly across all devices and screen sizes.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🗺️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Location-Based Matching</h3>
              <p className="text-gray-600">Smart geolocation features to connect the closest food providers with NGOs for faster pickup.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Impact Analytics</h3>
              <p className="text-gray-600">Track your impact with detailed analytics on meals rescued, CO₂ saved, and community reach.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🔔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Notifications</h3>
              <p className="text-gray-600">Instant notifications for new food listings, pickup confirmations, and urgent requests.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rating System</h3>
              <p className="text-gray-600">Transparent rating system to ensure quality service and build trust within the community.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-xl">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gamification & Rewards</h3>
              <p className="text-gray-600">Earn badges and certificates for your contributions to sharing good food and helping communities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Showcase */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Stories of Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the beautiful moments when good food reaches people in need. Every story shows how our community comes together to make a difference.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Sample Gallery Items */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-green-200 to-primary-200 flex items-center justify-center">
                <div className="text-6xl">🍽️</div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Community Lunch</h3>
                <p className="text-sm text-gray-600 mb-3">45 families served warm meals at the downtown shelter</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>📍 Downtown Center</span>
                  <span>👥 45 helped</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
                <div className="text-6xl">🎂</div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Holiday Distribution</h3>
                <p className="text-sm text-gray-600 mb-3">Special holiday meals shared with seniors</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>📍 Senior Center</span>
                  <span>👥 80 helped</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-yellow-200 to-orange-200 flex items-center justify-center">
                <div className="text-6xl">🥗</div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">School Program</h3>
                <p className="text-sm text-gray-600 mb-3">Fresh produce distributed to student families</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>📍 Local School</span>
                  <span>👥 120 helped</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <Link 
              href="/gallery" 
              className="inline-flex items-center bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              📸 View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"
          animate={{ 
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.h2 
            className="text-3xl lg:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Ready to Make a Difference?
          </motion.h2>
          <motion.p 
            className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of food providers and NGOs who are already making an impact. 
            Together, we can build a world where good food reaches everyone who needs it.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/register" className="group bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl relative overflow-hidden">
                <span className="relative z-10">🚀 Join the Movement</span>
                <motion.div
                  className="absolute inset-0 bg-green-100 opacity-0 group-hover:opacity-50"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="#how-it-works" className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-green-600 transition-all">
                💡 Learn More
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <motion.div 
          className="absolute top-0 left-1/3 w-40 h-40 bg-green-600/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="md:col-span-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                🍽️ Annadaan
              </h3>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Sharing good food and strengthening communities through technology and collaboration. 
                Every meal saved is a step towards a more sustainable and caring world.
              </p>
              <div className="mt-6 flex space-x-4">
                {['🌍', '❤️', '🤝', '🌱'].map((emoji, index) => (
                  <motion.div
                    key={index}
                    className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center cursor-pointer"
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{emoji}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            {[
              {
                title: "Platform",
                links: [
                  { name: "Get Started", href: "/register", icon: "🚀" },
                  { name: "How It Works", href: "#how-it-works", icon: "💡" },
                  { name: "Features", href: "#features", icon: "⭐" }
                ]
              },
              {
                title: "Community",
                links: [
                  { name: "Gallery", href: "/gallery", icon: "📸" },
                  { name: "Success Stories", href: "/stories", icon: "📖" },
                  { name: "Blog", href: "/blog", icon: "✍️" }
                ]
              }
            ].map((section, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h4 className="font-semibold mb-4 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <motion.li 
                      key={linkIndex}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link 
                        href={link.href} 
                        className="text-gray-400 hover:text-green-400 transition-colors flex items-center group"
                      >
                        <span className="mr-2 group-hover:scale-110 transition-transform">{link.icon}</span>
                        {link.name}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            className="border-t border-gray-800 mt-12 pt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400">
              © 2025 Annadaan. Made with{' '}
              <motion.span 
                className="text-red-400 inline-block"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ❤️
              </motion.span>
              {' '}for a better world.
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}
