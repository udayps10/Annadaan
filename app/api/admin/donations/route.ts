import { NextResponse, NextRequest } from 'next/server'
import { executeQuery } from '@/lib/database'
import { handleError, handleSuccess } from '@/lib/errors'
import { createAuthContext } from '@/lib/middleware'

interface UPIDonationWithDonor {
  id: number
  donor_id: number
  amount: number
  transaction_id: string
  payment_screenshot: string | null
  status: string
  created_at: Date
  reviewed_at: Date | null
  reviewed_by: number | null
  receipt_sent: number
  full_name: string
  email: string
  phone: string
}

interface ItemDonationWithDonor {
  id: number
  donor_id: number
  item_title: string
  quantity: number
  pickup_datetime: Date
  pickup_address: string
  status: string
  created_at: Date
  reviewed_at: Date | null
  reviewed_by: number | null
  collected_at: Date | null
  approval_photo: string | null
  full_name: string
  email: string
  phone: string
}

// Get all pending donations for admin review
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = createAuthContext(request)
    auth.requireAdmin()

    // Fetch UPI donations (pending and approved) with donor details
    const upiDonations = await executeQuery<UPIDonationWithDonor[]>(
      `SELECT u.*, d.full_name, d.email, d.phone 
       FROM upi_donations u
       JOIN individual_donors d ON u.donor_id = d.id
       WHERE u.status IN ('pending', 'approved')
       ORDER BY u.created_at DESC`
    )

    // Fetch pending item donations with donor details
    const itemDonations = await executeQuery<ItemDonationWithDonor[]>(
      `SELECT i.*, d.full_name, d.email, d.phone 
       FROM item_donations i
       JOIN individual_donors d ON i.donor_id = d.id
       WHERE i.status IN ('pending', 'approved')
       ORDER BY i.pickup_datetime ASC`
    )

    return handleSuccess({
      upiDonations,
      itemDonations
    })

  } catch (error) {
    return handleError(error as Error)
  }
}

