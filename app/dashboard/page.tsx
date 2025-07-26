'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // In a real app, you'd get this from your auth context/session
    // For now, we'll check localStorage or redirect to login
    const userType = localStorage.getItem('userType') || 'vendor' // Default to vendor for demo
    
    // Redirect based on user type
    switch (userType) {
      case 'vendor':
        router.push('/dashboard/vendor')
        break
      case 'ngo':
        router.push('/dashboard/ngo')
        break
      case 'admin':
        router.push('/dashboard/admin')
        break
      default:
        router.push('/login')
        break
    }
  }, [router])

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}
