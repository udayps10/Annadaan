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
    name: "Team Member 1",
    role: "Operations & Coordination",
    contribution: "Manages day-to-day operations and coordinates between food providers and NGOs to ensure seamless food rescue.",
    imageUrl: "/team/member1.svg"
  },
  {
    name: "Team Member 2",
    role: "Technology & Development",
    contribution: "Builds and maintains the platform, ensuring reliability and implementing features that make food rescue efficient.",
    imageUrl: "/team/member2.svg"
  },
  {
    name: "Team Member 3",
    role: "Community Outreach",
    contribution: "Connects with restaurants, NGOs, and volunteers to grow the network and raise awareness about food waste.",
    imageUrl: "/team/member3.svg"
  },
  {
    name: "Team Member 4",
    role: "Logistics & Planning",
    contribution: "Organizes pickup schedules and routes, ensuring food reaches those in need quickly and efficiently.",
    imageUrl: "/team/member4.svg"
  },
  {
    name: "Team Member 5",
    role: "Impact & Documentation",
    contribution: "Tracks our impact, documents success stories, and manages communications with our community.",
    imageUrl: "/team/member5.svg"
  }
]

const mentor: TeamMember = {
  name: "Mentor Name",
  role: "Mentor",
  contribution: "Provides strategic guidance and mentorship, helping the team navigate challenges and scale impact.",
  imageUrl: "/team/mentor.svg",
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
              It's not just business,{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                it's personal.
              </span>
            </h1>
          </motion.div>

          {/* Group Photo Banner */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={inViewHero ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/team/group-photo.svg"
                alt="Annadaan Team"
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            ref={refIntro}
            initial={{ opacity: 0, y: 50 }}
            animate={inViewIntro ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Hey, we're Annadaan.
            </h2>
            <div className="text-lg text-gray-700 leading-relaxed space-y-4">
              <p>
                We believe that business is the way to connect and put our values out around. 
                That's why we strive to create an environment where employees are valued, the 
                work matters, and every idea is heard and championed.
              </p>
              <p>
                We're breaking down barriers, prioritizing transparency, and creating systems and 
                processes within the four walls of our company. It's how we envision the future of 
                engagement.
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Our Team
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Each person brings unique skills and dedication to make food rescue work
              </p>
            </div>

            {/* Team Members Grid */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12"
              variants={staggerContainer}
              initial="initial"
              animate={inViewMembers ? "animate" : "initial"}
            >
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300"
                  whileHover={{ y: -8 }}
                >
                  <div className="relative w-full aspect-square bg-gray-200 overflow-hidden">
                    <Image
                      src={member.imageUrl}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <div className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mb-2">
                      {member.role}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
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
                  <div className="md:col-span-3 p-8 flex flex-col justify-center">
                    <div className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-4 w-fit">
                      ✨ {mentor.role}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {mentor.name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
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
      <section className="py-20 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 relative overflow-hidden">
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
            Want to Join Our Mission?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            We're always looking for passionate people who want to make a difference in fighting food waste and hunger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-green-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl">
              🚀 Get Started
            </Link>
            <Link href="/" className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-green-600 transition-all">
              💡 Learn More
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
