'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const response_data = await response.json()

      if (!response.ok) {
        throw new Error(response_data.message || 'Login failed')
      }

      // Extract data from standardized API response format
      // API returns: { success: true, data: { token, user, requiresVerification }, message: '...' }
      const data = response_data.success ? response_data.data : response_data

      // Validate response structure
      if (!data.user || !data.user.role) {
        throw new Error('Invalid response from server')
      }

      // Check if user requires verification
      if (data.requiresVerification) {
        // Store token temporarily for verification status access
        localStorage.setItem('temp_token', data.token)
        localStorage.setItem('userType', data.user.role)
        localStorage.setItem('userEmail', data.user.email)
        localStorage.setItem('userName', data.user.name)
        
        // Redirect to verification status page
        window.location.href = '/verification/status'
        return
      }

      // Store user data and token for verified users
      localStorage.setItem('userType', data.user.role)
      localStorage.setItem('userEmail', data.user.email)
      localStorage.setItem('userName', data.user.name)
      localStorage.setItem('token', data.token)
      
      // Redirect to appropriate dashboard
      const dashboardPath = `/dashboard/${data.user.role}`
      window.location.href = dashboardPath
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 mb-2">🍽️ Annadaan</h1>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="text-primary-600 hover:text-primary-500 font-medium">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <div className="text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Donor login option */}
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              href="/donation-drive/login"
              className="inline-flex items-center justify-center w-full px-4 sm:px-6 py-3 border-2 border-green-500 text-green-600 rounded-lg text-sm sm:text-base font-semibold hover:bg-green-50 transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">🎁</span>
              Login as Donor
            </Link>
            <p className="mt-2 text-xs text-gray-500">
              For Republic Day campaign and food donations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
