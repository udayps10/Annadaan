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

    // Get pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const exportAll = searchParams.get('export') === 'true'
    const offset = (page - 1) * limit

    if (exportAll) {
      // Export all approved donations without pagination
      const upiDonations = await executeQuery<UPIDonationWithDonor[]>(
        `SELECT u.*, d.full_name, d.email, d.phone 
         FROM upi_donations u
         JOIN individual_donors d ON u.donor_id = d.id
         WHERE u.status = 'approved'
         ORDER BY u.created_at DESC`
      )

      const itemDonations = await executeQuery<ItemDonationWithDonor[]>(
        `SELECT i.*, d.full_name, d.email, d.phone 
         FROM item_donations i
         JOIN individual_donors d ON i.donor_id = d.id
         WHERE i.status = 'approved'
         ORDER BY i.pickup_datetime ASC`
      )

      return handleSuccess({
        upiDonations,
        itemDonations,
        pagination: {
          total: upiDonations.length + itemDonations.length,
          page: 1,
          limit: upiDonations.length + itemDonations.length,
          totalPages: 1
        }
      })
    }

    // Get total counts for pagination
    const [upiCountResult] = await executeQuery<any[]>(
      `SELECT COUNT(*) as total FROM upi_donations WHERE status IN ('pending', 'approved')`
    )
    const [itemCountResult] = await executeQuery<any[]>(
      `SELECT COUNT(*) as total FROM item_donations WHERE status IN ('pending', 'approved')`
    )

    // Fetch UPI donations (pending and approved) with donor details - paginated
    const upiDonations = await executeQuery<UPIDonationWithDonor[]>(
      `SELECT u.*, d.full_name, d.email, d.phone 
       FROM upi_donations u
       JOIN individual_donors d ON u.donor_id = d.id
       WHERE u.status IN ('pending', 'approved')
       ORDER BY u.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    )

    // Fetch item donations (pending and approved) with donor details - paginated
    const itemDonations = await executeQuery<ItemDonationWithDonor[]>(
      `SELECT i.*, d.full_name, d.email, d.phone 
       FROM item_donations i
       JOIN individual_donors d ON i.donor_id = d.id
       WHERE i.status IN ('pending', 'approved')
       ORDER BY i.pickup_datetime ASC
       LIMIT ${limit} OFFSET ${offset}`
    )

    return handleSuccess({
      upiDonations,
      itemDonations,
      pagination: {
        upi: {
          total: upiCountResult.total,
          page,
          limit,
          totalPages: Math.ceil(upiCountResult.total / limit)
        },
        item: {
          total: itemCountResult.total,
          page,
          limit,
          totalPages: Math.ceil(itemCountResult.total / limit)
        }
      }
    })

  } catch (error) {
    return handleError(error as Error)
  }
}

