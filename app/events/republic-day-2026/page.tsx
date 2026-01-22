'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import ApprovedDonationsDisplay from '@/components/ApprovedDonationsDisplay'
import { getEventDonations } from '@/config/event-donations'

export default function RepublicDay2026() {
  const [activeTab, setActiveTab] = useState<'about' | 'donate' | 'donors'>('about')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-white to-green-600 opacity-10"></div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-6 space-x-4">
              <span className="text-6xl">🇮🇳</span>
              <h1 className="text-5xl md:text-7xl font-extrabold">
                <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Republic Day
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                  Donation Drive 2026
                </span>
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8">
              Celebrating 77 years of Indian democracy by feeding those in need. 
              Join us in making this Republic Day memorable for the underprivileged.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('donate')}
                className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Donate Now 🎁
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('donors')}
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                View Donors 💚
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-2xl p-2 shadow-lg">
            {(['about', 'donate', 'donors'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'about' && '📖'} {tab === 'donate' && '💝'} {tab === 'donors' && '🏆'}
                {' '}{tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* About Section */}
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">🎯</span>
                  Our Mission
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  This Republic Day, we're organizing a special donation drive to provide meals 
                  and essential food items to underprivileged communities across the nation. 
                  As we celebrate our democratic values, let's ensure that no one goes hungry.
                </p>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                    <div className="text-4xl mb-3">🍽️</div>
                    <h3 className="font-bold text-lg mb-2">Feed Families</h3>
                    <p className="text-gray-700 text-sm">
                      Provide nutritious meals to families in need during Republic Day celebrations
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="text-4xl mb-3">🤝</div>
                    <h3 className="font-bold text-lg mb-2">Community Unity</h3>
                    <p className="text-gray-700 text-sm">
                      Bring together donors, volunteers, and recipients in the spirit of patriotism
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="text-4xl mb-3">🌟</div>
                    <h3 className="font-bold text-lg mb-2">Create Impact</h3>
                    <p className="text-gray-700 text-sm">
                      Make a lasting difference by ensuring food security for vulnerable populations
                    </p>
                  </div>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-br from-orange-500 to-green-500 rounded-2xl shadow-xl p-8 md:p-12 text-white">
                <h2 className="text-3xl font-bold mb-8 flex items-center">
                  <span className="mr-3">🚀</span>
                  How It Works
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="font-bold text-xl mb-4">💰 UPI Donation</h3>
                    <ol className="space-y-2 text-white/90">
                      <li>1. Click "Donate via UPI" below</li>
                      <li>2. Enter your preferred amount (or scan QR to enter in app)</li>
                      <li>3. Complete payment via any UPI app</li>
                      <li>4. Upload payment screenshot</li>
                      <li>5. Admin approves and your name appears on donor wall!</li>
                    </ol>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="font-bold text-xl mb-4">🍱 Item Donation</h3>
                    <ol className="space-y-2 text-white/90">
                      <li>1. Click "Donate Food Items" below</li>
                      <li>2. Choose items (rice, dal, oil, etc.)</li>
                      <li>3. Schedule pickup or drop-off</li>
                      <li>4. Our team collects the items</li>
                      <li>5. After verification, you're featured as a donor!</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Impact Stats */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="mr-3">📊</span>
                  Our Impact (All Events)
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">10,000+</div>
                    <div className="text-gray-600">Meals Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">500+</div>
                    <div className="text-gray-600">Donors</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                    <div className="text-gray-600">Volunteers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">15+</div>
                    <div className="text-gray-600">Cities</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'donate' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  Choose Your Donation Method
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* UPI Donation */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-orange-200 rounded-xl p-8 hover:border-orange-500 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">💰</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">UPI Donation</h3>
                      <p className="text-gray-600 mb-6">
                        Quick & easy online payment via any UPI app. Get instant receipt after admin approval.
                      </p>
                      <Link href="/donation-drive/donate/upi">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl"
                        >
                          Donate via UPI →
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>

                  {/* Item Donation */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border-2 border-green-200 rounded-xl p-8 hover:border-green-500 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">🍱</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">Food Items</h3>
                      <p className="text-gray-600 mb-6">
                        Donate rice, dal, oil, or other essentials. We'll arrange pickup from your location.
                      </p>
                      <Link href="/donation-drive/donate/item">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl"
                        >
                          Donate Food Items →
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Donation Guidelines */}
              <div className="bg-gradient-to-br from-orange-50 to-green-50 rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="mr-3">📋</span>
                  Donation Guidelines
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">✓</span>
                    <span>All donations are tax-exempt under Section 80G (certificate provided upon request)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">✓</span>
                    <span>UPI donations: Min ₹50, any amount welcomed. May take 24-48 hours for admin approval.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">✓</span>
                    <span>Item donations: Ensure items are sealed/packaged and within expiry date</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">✓</span>
                    <span>Your name will appear on the donor wall only after admin verification and approval</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-3">✓</span>
                    <span>For queries: Contact us at annadaan.mission@gmail.com</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeTab === 'donors' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ApprovedDonationsDisplay 
                upiDonationIds={getEventDonations('republic-day-2026').upiDonationIds}
                itemDonationIds={getEventDonations('republic-day-2026').itemDonationIds}
                title="Republic Day 2026 - Approved Donors 🙏"
                showUPI={true}
                showItems={true}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-orange-600 via-white to-green-600 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Every Contribution Counts 🇮🇳
          </h2>
          <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
            Join hundreds of fellow Indians in making this Republic Day special for those in need.
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl border-2 border-orange-600"
            >
              ← Back to Home
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  )
}
