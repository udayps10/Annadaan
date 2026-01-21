'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

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

export default function DonationDrivePage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  
  const [ref1, inView1] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ref2, inView2] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ref3, inView3] = useInView({ threshold: 0.1, triggerOnce: true })

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
                href="/" 
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center group"
              >
                <span className="mr-2 group-hover:scale-110 transition-transform">🏠</span>
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full blur-xl opacity-40"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-24 h-24 bg-red-200 rounded-full blur-xl opacity-60"
          animate={{ 
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm font-semibold">
                <span className="mr-2 text-xl">🎉</span>
                Republic Day Special Event
              </span>
            </motion.div>

            <motion.h1 
              className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Community Donation Drive
              <br />
              <motion.span 
                className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                animate={{ 
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                26th January 2026
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Join us in celebrating Republic Day by giving back to our community. 
              Together, we can make a real difference in the lives of those who need it most.
            </motion.p>
            
            <motion.div 
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/donation-drive/register" className="group bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl text-center block relative overflow-hidden">
                  <span className="relative z-10">🙋 Register as Donor</span>
                  <motion.div
                    className="absolute inset-0 bg-white opacity-20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/donation-drive/login" className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl text-center block relative overflow-hidden">
                  <span className="relative z-10">🔐 Donor Login</span>
                  <motion.div
                    className="absolute inset-0 bg-white opacity-20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/donation-drive/donate" className="group border-2 border-orange-600 text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-all text-center block relative overflow-hidden">
                  <span className="relative z-10">❤️ Donate Now</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Event Details Section */}
      <section className="py-20 bg-white" ref={ref1}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={inView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              About This Special Event
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              On the occasion of Republic Day, we're inviting every citizen to participate in our community donation drive
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={inView1 ? "animate" : "initial"}
          >
            {[
              {
                icon: "📅",
                title: "Event Date",
                description: "26th January 2026 - Republic Day",
                color: "orange"
              },
              {
                icon: "👥",
                title: "Open to All",
                description: "Individual donors from the community can participate",
                color: "blue"
              },
              {
                icon: "🎯",
                title: "Our Mission",
                description: "Collect donations to support underprivileged families in our area",
                color: "green"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="relative group"
                variants={fadeInUp}
              >
                <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-r from-${item.color}-100 to-${item.color}-200 rounded-xl flex items-center justify-center mx-auto mb-6`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <span className="text-3xl">{item.icon}</span>
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-center">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Donation Types Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50" ref={ref2}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={inView2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Ways to Contribute
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose how you'd like to make a difference in your community
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate={inView2 ? "animate" : "initial"}
          >
            {/* UPI Donation Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-2xl font-bold mb-2">Monetary Donation</h3>
                <p className="text-blue-100">Donate via UPI - Quick & Secure</p>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-6">
                  {[
                    "Instant digital payment via UPI",
                    "Upload payment screenshot for verification",
                    "Receive email receipt after approval",
                    "100% transparent process with tracking"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-3 text-xl">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/donation-drive/donate?type=upi" className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                    Donate via UPI →
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Food/Item Donation Card */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
              variants={fadeInUp}
              whileHover={{ y: -10 }}
            >
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white">
                <div className="text-5xl mb-4">🍱</div>
                <h3 className="text-2xl font-bold mb-2">Food & Item Donation</h3>
                <p className="text-orange-100">Donate food, clothes, or essentials</p>
              </div>
              <div className="p-8">
                <ul className="space-y-4 mb-6">
                  {[
                    "Donate surplus food or essential items",
                    "Schedule convenient pickup time",
                    "We'll collect from your location",
                    "Get confirmation with photo proof"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-3 text-xl">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/donation-drive/donate?type=item" className="block w-full bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all">
                    Donate Items →
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white" ref={ref3}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={inView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 3-step process to make your contribution
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="initial"
            animate={inView3 ? "animate" : "initial"}
          >
            {[
              {
                step: "01",
                icon: "📝",
                title: "Register as Donor",
                description: "Fill a simple form with your basic details to register as an individual donor",
                color: "blue"
              },
              {
                step: "02",
                icon: "🎁",
                title: "Choose Donation Type",
                description: "Select whether you want to donate money via UPI or donate food/items",
                color: "orange"
              },
              {
                step: "03",
                icon: "✅",
                title: "Track & Confirm",
                description: "Upload proof, get admin approval, and track your donation status in real-time",
                color: "green"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="relative"
                variants={fadeInUp}
              >
                <div className="text-center">
                  <motion.div 
                    className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm z-10"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={inView3 ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
                    transition={{ delay: index * 0.2 + 0.5, type: "spring" }}
                  >
                    {item.step}
                  </motion.div>
                  
                  <motion.div 
                    className={`w-24 h-24 bg-gradient-to-r from-${item.color}-100 to-${item.color}-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    <span className="text-4xl">{item.icon}</span>
                  </motion.div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                {index < 2 && (
                  <motion.div 
                    className="hidden md:block absolute top-12 left-full w-12 h-0.5 bg-gradient-to-r from-orange-300 to-red-300"
                    initial={{ scaleX: 0 }}
                    animate={inView3 ? { scaleX: 1 } : { scaleX: 0 }}
                    transition={{ delay: index * 0.3 + 1 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 relative overflow-hidden">
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.h2 
            className="text-3xl lg:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Be Part of Something Special
          </motion.h2>
          <motion.p 
            className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            This Republic Day, let's come together as a community to support those in need. 
            Every contribution, big or small, makes a real difference.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/donation-drive/register" className="bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
                🚀 Get Started Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/donation-drive/my-donations" className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-orange-600 transition-all">
                📊 View My Donations
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent inline-block mb-4">
              🍽️ Annadaan
            </Link>
            <p className="text-gray-400 mb-6">
              Together, we can make a difference this Republic Day
            </p>
            <div className="flex justify-center space-x-6">
              {[
                { name: 'Home', href: '/' },
                { name: 'About', href: '/#about' },
                { name: 'Contact', href: '/contact' },
                { name: 'Terms', href: '/terms' }
              ].map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-orange-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-8">
              © 2026 Annadaan. Made with{' '}
              <motion.span 
                className="text-red-400 inline-block"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ❤️
              </motion.span>
              {' '}for our community.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}