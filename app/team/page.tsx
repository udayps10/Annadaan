'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
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

interface TeamMember {
  name: string
  role: string
  contribution: string
  imageUrl: string
  isMentor?: boolean
}

const teamMembers: TeamMember[] = [
  {
    name: "Arpit Singh",
    role: "CEO",
    contribution: "Leads the strategic vision and operations, ensuring Annadaan's mission reaches communities effectively.",
    imageUrl: "/images/team/arpit.png"
  },
  {
    name: "Raunak Singh",
    role: "CTO",
    contribution: "Oversees technology infrastructure and innovation, building robust systems for seamless food rescue.",
    imageUrl: "/images/team/raunak.png"
  },
  {
    name: "Rishit Singh",
    role: "CFO",
    contribution: "Manages financial planning and ensures sustainable growth while maximizing impact per rupee spent.",
    imageUrl: "/images/team/rishit.png"
  },
  {
    name: "Udaypratap Singh",
    role: "CMO",
    contribution: "Drives marketing strategy and brand awareness to expand our network of partners and beneficiaries.",
    imageUrl: "/images/team/uday.png"
  },
  {
    name: "Ashmit Singh",
    role: "Android Developer & Researcher",
    contribution: "Develops mobile applications and conducts research to enhance platform capabilities and user experience.",
    imageUrl: "/images/team/ashmit.png"
  },
  {
    name: "Sakshi Singh",
    role: "Creative & Social Media",
    contribution: "Crafts compelling content and manages social media presence to engage and inspire our community.",
    imageUrl: "/images/team/sakshi.png"
  },
  {
    name: "Mahek Singh",
    role: "Creative & Social Media",
    contribution: "Creates visual content and manages online engagement to amplify our mission and impact stories.",
    imageUrl: "/images/team/mahek.png"
  }
]

const mentor: TeamMember = {
  name: "Loukik Salvi",
  role: "Mentor",
  contribution: "Provides strategic guidance and mentorship, helping the team navigate challenges and scale impact effectively.",
  imageUrl: "/images/team/loukik.png",
  isMentor: true
}

export default function TeamPage() {
  const [refHero, inViewHero] = useInView({ threshold: 0.1, triggerOnce: true })
  const [refIntro, inViewIntro] = useInView({ threshold: 0.1, triggerOnce: true })
  const [refMembers, inViewMembers] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Navigation */}
      <motion.nav 
        className="bg-white/95 backdrop-blur-md border-b border-green-200 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="Annadaan" className="h-10" />
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              <Link href="/gallery" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Gallery
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Login
              </Link>
              <Link href="/register" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Group Photo */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            ref={refHero}
            initial={{ opacity: 0, y: 50 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Meet the team{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                rescuing food.
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto">
              We're students and young professionals connecting surplus food with those who need it most across India.
            </p>
          </motion.div>

          {/* Group Photo Banner */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/images/team/img.png"
                alt="Annadaan Founding Team"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <p className="text-center text-gray-600 mt-4 text-lg">
              The founding team of Annadaan, united by a passion to end food waste and hunger.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white border-l-4 border-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={refIntro}
            initial={{ opacity: 0, y: 50 }}
            animate={inViewIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Why we started this.
            </h2>
            <div className="text-base sm:text-lg text-gray-700 leading-relaxed space-y-4">
              <p className="font-semibold text-lg sm:text-xl text-orange-600">
                In India, 68 million tonnes of food is wasted every year while 190 million people go to bed hungry.
              </p>
              <p>
                We saw restaurants throwing away perfectly good food at the end of each day. We saw NGOs struggling to feed people consistently. We saw a gap that technology could bridge.
              </p>
              <p>
                So we built Annadaan — a platform that connects food donors (restaurants, events, individuals) with verified NGOs and those in need. Real-time. Local. Transparent.
              </p>
              <p className="font-medium">
                We're not a nonprofit. We're not a corporate CSR initiative. We're a group of people who couldn't ignore the problem anymore.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={refMembers}
            initial={{ opacity: 0, y: 50 }}
            animate={inViewMembers ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Who's building this
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                Seven people balancing college, early careers, and late nights — because good food shouldn't go to waste.
              </p>
            </div>

            {/* Team Members Grid - 4+3 balanced layout */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
              variants={staggerContainer}
              initial="initial"
              animate={inViewMembers ? "animate" : "initial"}
            >
              {teamMembers.slice(0, 4).map((member, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  whileHover={{ y: -8 }}
                >
                  <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <div className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                      {member.role}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {member.contribution}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Second row with 3 members - centered */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              animate={inViewMembers ? "animate" : "initial"}
            >
              {teamMembers.slice(4, 7).map((member, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  whileHover={{ y: -8 }}
                >
                  <div className="relative w-full h-64 bg-gray-200 overflow-hidden">
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <div className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                      {member.role}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      {member.contribution}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Mentor Section */}
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate={inViewMembers ? "animate" : "initial"}
              transition={{ delay: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-xl overflow-hidden border-2 border-green-200">
                <div className="grid md:grid-cols-5 gap-0">
                  <div className="md:col-span-2 relative h-64 md:h-auto bg-gray-200">
                    <Image
                      src={mentor.imageUrl}
                      alt={mentor.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="md:col-span-3 p-6 sm:p-8 flex flex-col justify-center">
                    <div className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4 w-fit">
                      ✨ {mentor.role}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {mentor.name}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {mentor.contribution}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
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
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Someone's hungry right now.
          </h2>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            You can donate food today. You can help deliver it. You can be part of the solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-orange-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
              Start Donating Food
            </Link>
            <Link href="/donation-drive" className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-orange-600 transition-all">
              See Active Drives
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img src="/logo.png" alt="Annadaan" className="h-12 mb-4" />
              <p className="text-gray-400 leading-relaxed">
                Sharing good food and strengthening communities through technology and collaboration.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-green-400 transition-colors">Home</Link></li>
                <li><Link href="/#features" className="text-gray-400 hover:text-green-400 transition-colors">Features</Link></li>
                <li><Link href="/gallery" className="text-gray-400 hover:text-green-400 transition-colors">Gallery</Link></li>
                <li><Link href="/team" className="text-gray-400 hover:text-green-400 transition-colors">Team</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Get Started</h4>
              <ul className="space-y-2">
                <li><Link href="/register" className="text-gray-400 hover:text-green-400 transition-colors">Register</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-green-400 transition-colors">Login</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">© 2025 Annadaan. Made with ❤️ for a better world.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
