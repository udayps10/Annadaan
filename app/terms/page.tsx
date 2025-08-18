'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'

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

export default function TermsPage() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])
  
  const [ref1, inView1] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ref2, inView2] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ref3, inView3] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ref4, inView4] = useInView({ threshold: 0.1, triggerOnce: true })

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const sections = [
    {
      id: 'acceptance',
      title: 'Acceptance of Terms',
      icon: '✅',
      color: 'green',
      content: [
        'By accessing and using Annadaan ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.',
        'If you do not agree to these terms, please do not use our platform.',
        'We reserve the right to update these terms at any time without prior notice.',
        'Your continued use of the platform after changes constitutes acceptance of the new terms.'
      ]
    },
    {
      id: 'definitions',
      title: 'Definitions',
      icon: '📚',
      color: 'blue',
      content: [
        '"Platform" refers to the Annadaan web application and all associated services.',
        '"Users" include food providers (vendors, restaurants, hotels) and food recipients (NGOs, shelters).',
        '"Food Listings" are posts created by food providers about available surplus food.',
        '"Pickup Requests" are requests made by NGOs to collect listed food items.',
        '"Content" includes all text, images, data, and other materials posted on the platform.'
      ]
    },
    {
      id: 'user-responsibilities',
      title: 'User Responsibilities',
      icon: '👤',
      color: 'purple',
      content: [
        'Food Providers must ensure all listed food is safe for consumption and meets health standards.',
        'All food listings must include accurate information about quantity, type, and expiry dates.',
        'NGOs and shelters must have proper authorization and capacity to handle food distribution.',
        'Users must respond promptly to pickup requests and maintain reliable communication.',
        'All parties must comply with local food safety regulations and health department guidelines.'
      ]
    },
    {
      id: 'food-safety',
      title: 'Food Safety & Quality',
      icon: '🛡️',
      color: 'red',
      content: [
        'Food providers are solely responsible for ensuring food safety and quality.',
        'All food must be properly stored and handled according to food safety standards.',
        'Expired or unsafe food must not be listed on the platform.',
        'Users must report any food safety concerns immediately.',
        'Annadaan provides a platform for connection but does not guarantee food safety or quality.'
      ]
    },
    {
      id: 'liability',
      title: 'Limitation of Liability',
      icon: '⚖️',
      color: 'orange',
      content: [
        'Annadaan acts solely as a facilitating platform connecting food providers with recipients.',
        'We are not responsible for the quality, safety, or condition of food exchanged through our platform.',
        'Users engage in food exchange activities at their own risk.',
        'Annadaan shall not be liable for any damages arising from food-related incidents.',
        'Users must maintain appropriate insurance coverage for their activities.'
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Protection',
      icon: '🔒',
      color: 'teal',
      content: [
        'We collect only necessary information to facilitate food rescue operations.',
        'User data is protected according to applicable data protection laws.',
        'Personal information is not shared with third parties without consent.',
        'Users can request data deletion by contacting our support team.',
        'We use cookies and similar technologies to improve platform functionality.'
      ]
    },
    {
      id: 'verification',
      title: 'User Verification',
      icon: '🔍',
      color: 'indigo',
      content: [
        'All users must complete verification processes before accessing platform features.',
        'Food providers must provide valid business licenses and health certifications.',
        'NGOs must provide proof of registration and authorization documents.',
        'False information during verification may result in account suspension.',
        'We reserve the right to verify user information at any time.'
      ]
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual Property',
      icon: '©️',
      color: 'pink',
      content: [
        'All platform content, design, and functionality are owned by Annadaan.',
        'Users retain ownership of content they post but grant us usage rights.',
        'Users may not copy, modify, or distribute platform content without permission.',
        'Trademark and copyright violations will result in account termination.',
        'Users must respect intellectual property rights of others.'
      ]
    },
    {
      id: 'prohibited-activities',
      title: 'Prohibited Activities',
      icon: '🚫',
      color: 'red',
      content: [
        'Listing expired, contaminated, or unsafe food items.',
        'Providing false information about food quality or quantity.',
        'Using the platform for commercial sale of food items.',
        'Harassment, discrimination, or inappropriate behavior toward other users.',
        'Attempting to circumvent verification processes or platform security.'
      ]
    },
    {
      id: 'termination',
      title: 'Account Termination',
      icon: '🔚',
      color: 'gray',
      content: [
        'We may suspend or terminate accounts for violation of these terms.',
        'Users may close their accounts at any time through platform settings.',
        'Termination does not relieve users of obligations incurred before termination.',
        'We reserve the right to retain certain data for legal compliance.',
        'Terminated users may appeal decisions through our support channels.'
      ]
    }
  ]

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 to-white">
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
      <section className="relative py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
        {/* Animated Background Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-green-200 rounded-full blur-xl opacity-40"
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
          className="absolute top-40 right-20 w-24 h-24 bg-emerald-200 rounded-full blur-xl opacity-60"
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.h1 
            className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Terms & Conditions
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Understanding our platform guidelines for safe and effective food rescue operations. 
            Last updated: August 2025
          </motion.p>
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                {[
                  { icon: '📋', text: '10 Key Sections' },
                  { icon: '🔍', text: 'Easy to Navigate' },
                  { icon: '⚡', text: 'Interactive Design' }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    <span>{item.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Navigation */}
      <motion.section 
        className="py-16 bg-white/50 backdrop-blur-sm border-b border-gray-100"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {sections.slice(0, 10).map((section, index) => (
              <motion.a
                key={section.id}
                href={`#${section.id}`}
                className={`bg-gradient-to-r from-${section.color}-100 to-${section.color}-200 p-4 rounded-xl text-center hover:shadow-lg transition-all group cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.9 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {section.icon}
                </div>
                <div className={`text-sm font-medium text-${section.color}-700 group-hover:text-${section.color}-800`}>
                  {section.title}
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Terms Sections */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {sections.map((section, index) => (
              <motion.div 
                key={section.id}
                id={section.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                variants={fadeInUp}
                transition={{ delay: index * 0.1 }}
                ref={index === 0 ? ref1 : index === 3 ? ref2 : index === 6 ? ref3 : index === 8 ? ref4 : undefined}
              >
                <motion.div 
                  className={`bg-gradient-to-r from-${section.color}-50 to-${section.color}-100 p-6 cursor-pointer`}
                  onClick={() => toggleSection(section.id)}
                  whileHover={{ backgroundColor: `rgba(${section.color === 'green' ? '34, 197, 94' : section.color === 'blue' ? '59, 130, 246' : section.color === 'purple' ? '168, 85, 247' : section.color === 'red' ? '239, 68, 68' : section.color === 'orange' ? '249, 115, 22' : section.color === 'teal' ? '20, 184, 166' : section.color === 'indigo' ? '99, 102, 241' : section.color === 'pink' ? '236, 72, 153' : '107, 114, 128'}, 0.1)` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <motion.div 
                        className={`w-12 h-12 bg-gradient-to-r from-${section.color}-200 to-${section.color}-300 rounded-xl flex items-center justify-center mr-4`}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <span className="text-2xl">{section.icon}</span>
                      </motion.div>
                      <div>
                        <h3 className={`text-xl font-bold text-${section.color}-800 group-hover:text-${section.color}-900 transition-colors`}>
                          {section.title}
                        </h3>
                        <p className={`text-sm text-${section.color}-600 mt-1`}>
                          Click to {expandedSections[section.id] ? 'collapse' : 'expand'} details
                        </p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSections[section.id] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`text-2xl text-${section.color}-600`}
                    >
                      ⬇️
                    </motion.div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: expandedSections[section.id] ? 'auto' : 0,
                    opacity: expandedSections[section.id] ? 1 : 0
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 bg-white">
                    <motion.div 
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="initial"
                      animate={expandedSections[section.id] ? "animate" : "initial"}
                    >
                      {section.content.map((paragraph, pIndex) => (
                        <motion.div
                          key={pIndex}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          variants={fadeInUp}
                          whileHover={{ x: 5 }}
                        >
                          <div className={`w-2 h-2 rounded-full bg-${section.color}-400 mt-2 flex-shrink-0`} />
                          <p className="text-gray-700 leading-relaxed">{paragraph}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact & Support Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.h2 
            className="text-3xl lg:text-4xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Have Questions About Our Terms?
          </motion.h2>
          <motion.p 
            className="text-xl text-green-100 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Our support team is here to help clarify any aspects of our terms and conditions. 
            We believe in transparency and want you to feel confident using our platform.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a 
                href="mailto:support@annadaan.com" 
                className="group bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl relative overflow-hidden flex items-center"
              >
                <span className="mr-2 text-2xl">📧</span>
                <span className="relative z-10">Contact Support</span>
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/faq" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-green-600 transition-all flex items-center"
              >
                <span className="mr-2 text-2xl">❓</span>
                View FAQ
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center items-center space-x-4 mb-6">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                🍽️ Annadaan
              </Link>
            </div>
            <div className="flex justify-center space-x-6 mb-6">
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Cookie Policy', href: '/cookies' },
                { name: 'Contact Us', href: '/contact' }
              ].map((link, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-green-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <p className="text-gray-400 text-sm">
              © 2025 Annadaan. All rights reserved. Made with{' '}
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
