'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UPIQRResponse {
  success: boolean
  qrCode: string
  upiUrl: string
  amount: number
  upiId: string
  payeeName: string
  error?: string
}

export default function UPIPaymentGenerator() {
  const [amount, setAmount] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [qrData, setQrData] = useState<UPIQRResponse | null>(null)
  const [error, setError] = useState<string>('')

  const handleGenerateQR = async () => {
    // Reset states
    setError('')
    setQrData(null)

    // Validate amount
    const amountNum = parseFloat(amount)
    
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    if (amountNum > 100000) {
      setError('Amount cannot exceed ₹1,00,000')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/generate-upi-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amountNum })
      })

      const data: UPIQRResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate QR code')
      }

      setQrData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setAmount('')
    setQrData(null)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            UPI Donation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Republic Day 2026 Donation Drive
          </p>
        </div>

        {!qrData ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Donation Amount (₹)
              </label>
              <Input
                id="amount"
                type="number"
                min="1"
                max="100000"
                step="1"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGenerateQR()
                  }
                }}
                disabled={loading}
                className="text-lg"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={handleGenerateQR}
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            >
              {loading ? 'Generating...' : 'Proceed to Pay'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-orange-200 dark:border-orange-800">
              <div className="flex justify-center mb-4">
                <img
                  src={qrData.qrCode}
                  alt="UPI QR Code"
                  className="w-64 h-64"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  ₹ {qrData.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Scan with any UPI app to pay
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                  {qrData.upiId}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                Generate Another QR
              </Button>
              
              <p className="text-xs text-center text-gray-500 dark:text-gray-500">
                Amount is pre-filled in the UPI app
              </p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-500">
            Secure UPI payment • Instant confirmation
          </p>
        </div>
      </Card>
    </div>
  )
}
