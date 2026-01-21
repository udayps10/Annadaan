import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { donorId, itemTitle, quantity, pickupDatetime, pickupAddress } = body

    // Validation
    if (!donorId || !itemTitle || !quantity || !pickupDatetime || !pickupAddress) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // Validate pickup datetime is not in the past
    const pickupDate = new Date(pickupDatetime)
    if (pickupDate < new Date()) {
      return NextResponse.json(
        { error: 'Pickup datetime cannot be in the past' },
        { status: 400 }
      )
    }

    // Generate unique transaction ID: ITEM-YYYYMMDD-HHMMSS-RANDOM
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    const transactionId = `ITEM-${dateStr}-${timeStr}-${randomStr}`

    // Insert item donation
    const result = await query(
      `INSERT INTO item_donations (donor_id, transaction_id, item_title, quantity, pickup_datetime, pickup_address, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [donorId, transactionId, itemTitle, quantity, pickupDatetime, pickupAddress]
    ) as any

    // Log the action
    await query(
      `INSERT INTO donation_logs (donor_id, donation_type, donation_id, action) 
       VALUES (?, 'item', ?, 'submitted')`,
      [donorId, result.insertId]
    )

    return NextResponse.json({
      message: 'Item donation request submitted successfully',
      donationId: result.insertId,
      transactionId
    })

  } catch (error) {
    console.error('Item donation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit donation. Please try again.' },
      { status: 500 }
    )
  }
}
