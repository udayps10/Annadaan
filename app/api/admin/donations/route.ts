import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

// Get all pending donations for admin review
export async function GET(request: Request) {
  try {
    // You might want to add session/auth check here for admin

    // Fetch UPI donations (pending and approved) with donor details
    const upiDonations = await query(
      `SELECT u.*, d.full_name, d.email, d.phone 
       FROM upi_donations u
       JOIN individual_donors d ON u.donor_id = d.id
       WHERE u.status IN ('pending', 'approved')
       ORDER BY u.created_at DESC`
    ) as any[]

    // Fetch pending item donations with donor details
    const itemDonations = await query(
      `SELECT i.*, d.full_name, d.email, d.phone 
       FROM item_donations i
       JOIN individual_donors d ON i.donor_id = d.id
       WHERE i.status IN ('pending', 'approved')
       ORDER BY i.pickup_datetime ASC`
    ) as any[]

    return NextResponse.json({
      upiDonations,
      itemDonations
    })

  } catch (error) {
    console.error('Fetch admin donations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}
