'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface VerificationDocument {
  document_type: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  updated_at: string
}

interface VerificationProfile {
  verification_status: 'pending' | 'approved' | 'rejected' | 'incomplete'
  verification_notes?: string
  submitted_at: string
  reviewed_at?: string
  approved_at?: string
  rejection_reason?: string
}

interface User {
  id: number
  name: string
  full_name?: string
  email: string
  role: 'vendor' | 'ngo'
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
}

interface VerificationStatus {
  user: User
  verificationProfile: VerificationProfile | null
  documents: VerificationDocument[]
  isVerified: boolean
  canAccessDashboard: boolean
}

export default function VerificationStatus() {
  const [status, setStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchVerificationStatus()
  }, [])

  const fetchVerificationStatus = async () => {
    try {
      const token = localStorage.getItem('temp_token') || localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/verification/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(data)

        // If already verified, redirect to dashboard
        if (data.canAccessDashboard) {
          localStorage.setItem('token', token)
          localStorage.removeItem('temp_token')
          
          if (data.user.role === 'vendor') {
            router.push('/dashboard/vendor')
          } else if (data.user.role === 'ngo') {
            router.push('/dashboard/ngo')
          }
        }
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch verification status')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'rejected':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      case 'pending':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const formatDocumentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('temp_token')
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchVerificationStatus}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Try Again
            </button>
            <Link
              href="/login"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 text-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  const overallStatus = status.user.status

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Verification Status</h1>
                <p className="text-green-100 mt-1">Welcome, {status.user.full_name || status.user.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Overall Status */}
          <div className="p-6 border-b">
            <div className="flex items-center">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(overallStatus)}`}>
                {getStatusIcon(overallStatus)}
                <span className="ml-2 capitalize">{overallStatus}</span>
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Account Status: {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)}
                </h2>
                <p className="text-gray-600 text-sm">
                  {overallStatus === 'pending' && 'Your account is under review by our admin team.'}
                  {overallStatus === 'approved' && 'Your account has been verified! You can now access the dashboard.'}
                  {overallStatus === 'rejected' && 'Your account verification was rejected. Please contact support.'}
                </p>
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Verification</h3>
            
            {status.documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {status.documents.map((doc, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(doc.status)}
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900">
                            {formatDocumentType(doc.document_type)}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </div>
                    </div>
                    {doc.admin_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">
                          <strong>Admin Notes:</strong> {doc.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verification Notes */}
          {status.verificationProfile?.verification_notes && (
            <div className="p-6 border-t bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Notes</h3>
              <p className="text-gray-700">{status.verificationProfile.verification_notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-4">
              {status.canAccessDashboard ? (
                <Link
                  href={status.user.role === 'vendor' ? '/dashboard/vendor' : '/dashboard/ngo'}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Go to Dashboard
                </Link>
              ) : (
                <div className="text-gray-600">
                  <p className="text-sm">Dashboard access will be available once your account is approved.</p>
                </div>
              )}
              
              <button
                onClick={fetchVerificationStatus}
                className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Verification Process</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Documents are reviewed within 24-48 hours</li>
                <li>• Make sure all documents are clear and readable</li>
                <li>• Accepted formats: PDF, JPG, PNG</li>
                <li>• Maximum file size: 10MB per document</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600 mb-2">
                If you have questions about your verification status, please contact our support team.
              </p>
              <p className="text-sm text-green-600 font-medium">
                Email: support@foodrescue.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
