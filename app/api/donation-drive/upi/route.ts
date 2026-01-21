import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { donorId, paymentScreenshot, amount } = body

    // Validation
    if (!donorId || !paymentScreenshot) {
      return NextResponse.json(
        { error: 'Donor ID and payment screenshot are required' },
        { status: 400 }
      )
    }

    // Validate amount
    const donationAmount = parseFloat(amount)
    if (!amount || isNaN(donationAmount) || donationAmount <= 0) {
      return NextResponse.json(
        { error: 'Valid donation amount is required' },
        { status: 400 }
      )
    }

    // Verify donor exists
    const donor = await query(
      'SELECT id FROM individual_donors WHERE id = ?',
      [donorId]
    ) as any[]

    if (donor.length === 0) {
      return NextResponse.json(
        { error: 'Invalid donor ID' },
        { status: 404 }
      )
    }

    // Generate unique transaction ID: UPI-YYYYMMDD-HHMMSS-RANDOM
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    const transactionId = `UPI-${dateStr}-${timeStr}-${randomStr}`

    // Insert UPI donation
    const result = await query(
      `INSERT INTO upi_donations (donor_id, amount, transaction_id, payment_screenshot, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [donorId, donationAmount, transactionId, paymentScreenshot]
    ) as any

    // Log the action
    await query(
      `INSERT INTO donation_logs (donor_id, donation_type, donation_id, action) 
       VALUES (?, 'upi', ?, 'submitted')`,
      [donorId, result.insertId]
    )

    return NextResponse.json({
      message: 'UPI donation submitted successfully',
      donationId: result.insertId,
      transactionId
    })

  } catch (error) {
    console.error('UPI donation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit donation. Please try again.' },
      { status: 500 }
    )
  }
}
