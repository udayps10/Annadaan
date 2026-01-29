'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Image from 'next/image'

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
    imageUrl: "/images/team/ashmit.png"
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
    imageUrl: "/images/team/ashmit.png"
  },
  {
    name: "Udaypratap Singh",
    role: "CMO",
    contribution: "Drives marketing strategy and brand awareness to expand our network of partners and beneficiaries.",
    imageUrl: "/images/team/uday.png"
  },
  {
    name: "Arpit Singh",
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

export default function TeamSection() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [refMembers, inViewMembers] = useInView({ threshold: 0.1, triggerOnce: true })

  return (
    <section id="team" className="py-20 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
      {/* Background decoration */}
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
        {/* Hero Banner - Group Photo */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="relative w-full h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <Image
              src="/team/group-photo.svg"
              alt="Annadaan Team"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 lg:p-12">
              <motion.h1 
                className="text-3xl lg:text-5xl font-bold text-white mb-3"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                The People Behind Annadaan
              </motion.h1>
              <motion.p 
                className="text-lg lg:text-xl text-green-100 max-w-3xl"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                A small team working together to ensure good food reaches everyone who needs it
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Team Members Grid */}
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

          {/* First row with 4 members */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"
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
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <div className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                    {member.role}
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {member.contribution}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Second row with 3 members - centered */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate={inViewMembers ? "animate" : "initial"}
          >
            {teamMembers.slice(4, 7).map((member, index) => (
              <motion.div
                key={index + 4}
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
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <div className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
                    {member.role}
                  </div>
                  <p className="text-gray-600 leading-relaxed">
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
                <div className="md:col-span-2 relative h-80 md:h-auto bg-gray-200 overflow-hidden">
                  <Image
                    src={mentor.imageUrl}
                    alt={mentor.name}
                    fill
                    className="object-cover scale-105"
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
  )
}
