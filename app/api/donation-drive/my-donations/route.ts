import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const donorId = searchParams.get('donorId')

    if (!donorId) {
      return NextResponse.json(
        { error: 'Donor ID is required' },
        { status: 400 }
      )
    }

    // Fetch UPI donations
    const upiDonations = await query(
      `SELECT * FROM upi_donations 
       WHERE donor_id = ? 
       ORDER BY created_at DESC`,
      [donorId]
    ) as any[]

    // Fetch item donations
    const itemDonations = await query(
      `SELECT * FROM item_donations 
       WHERE donor_id = ? 
       ORDER BY created_at DESC`,
      [donorId]
    ) as any[]

    return NextResponse.json({
      upiDonations,
      itemDonations
    })

  } catch (error) {
    console.error('Fetch donations error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}
