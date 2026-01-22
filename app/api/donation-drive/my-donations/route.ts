import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { 
  handleError, 
  handleSuccess 
} from '@/lib/errors'
import { 
  validateFields, 
  validateRequired,
  parseInteger 
} from '@/lib/validation'

interface UPIDonation {
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
}

interface ItemDonation {
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
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const donorIdParam = searchParams.get('donorId')

    // Validate donor ID
    validateFields([
      { result: validateRequired(donorIdParam, 'Donor ID'), field: 'donorId' }
    ])

    const donorId = parseInteger(donorIdParam!, 'Donor ID')

    // Fetch UPI donations
    const upiDonations = await executeQuery<UPIDonation[]>(
      `SELECT * FROM upi_donations 
       WHERE donor_id = ? 
       ORDER BY created_at DESC`,
      [donorId]
    )

    // Fetch item donations
    const itemDonations = await executeQuery<ItemDonation[]>(
      `SELECT * FROM item_donations 
       WHERE donor_id = ? 
       ORDER BY created_at DESC`,
      [donorId]
    )

    return handleSuccess({
      upiDonations,
      itemDonations
    })

  } catch (error) {
    return handleError(error as Error)
  }
}

