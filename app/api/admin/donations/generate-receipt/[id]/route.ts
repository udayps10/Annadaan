import { NextResponse, NextRequest } from 'next/server'
import { executeQuery } from '@/lib/database'
import { generateDonationReceipt } from '@/lib/pdfReceipt'
import { createAuthContext } from '@/lib/middleware'
import { handleError, NotFoundError } from '@/lib/errors'
import { validateFields, validateEnum, parseInteger } from '@/lib/validation'

interface RouteParams {
  params: {
    id: string
  }
}

interface UPIDonationDetail {
  id: number
  donor_id: number
  amount: number
  transaction_id: string
  reviewed_at: Date
  full_name: string
  email: string
  phone: string
}

interface ItemDonationDetail {
  id: number
  donor_id: number
  transaction_id: string
  item_title: string
  quantity: number
  collected_at: Date
  full_name: string
  email: string
  phone: string
}

const ALLOWED_TYPES = ['upi', 'item'] as const

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'item'
    const token = url.searchParams.get('token')

    // Authenticate admin - check Authorization header first, then query param
    let auth
    try {
      auth = createAuthContext(request)
    } catch (error) {
      // If header auth fails, try token from query param
      if (token) {
        const requestWithToken = new NextRequest(request.url, {
          headers: new Headers({
            ...Object.fromEntries(request.headers),
            'Authorization': `Bearer ${token}`
          })
        })
        auth = createAuthContext(requestWithToken)
      } else {
        throw error
      }
    }
    auth.requireAdmin()

    // Validate inputs
    validateFields([
      { result: validateEnum(type, ALLOWED_TYPES), field: 'type' }
    ])

    const donationId = parseInteger(id, 'Donation ID')

    let donation: UPIDonationDetail | ItemDonationDetail
    let donationType: string
    let amount: number = 0
    let itemDescription: string | undefined
    let quantity: number | undefined

    if (type === 'upi') {
      // Fetch UPI donation details
      const upiDonations = await executeQuery<UPIDonationDetail[]>(
        `SELECT 
          ud.id,
          ud.donor_id,
          ud.amount,
          ud.transaction_id,
          ud.reviewed_at,
          id.full_name,
          id.email,
          id.phone
         FROM upi_donations ud
         JOIN individual_donors id ON ud.donor_id = id.id
         WHERE ud.id = ? AND ud.status = 'approved'`,
        [donationId]
      )

      if (upiDonations.length === 0) {
        throw new NotFoundError('UPI donation not found or not approved')
      }

      donation = upiDonations[0]
      donationType = 'UPI'
      amount = parseFloat(String(donation.amount)) || 0
    } else {
      // Fetch Item donation details
      const itemDonations = await executeQuery<ItemDonationDetail[]>(
        `SELECT 
          itd.id,
          itd.donor_id,
          itd.transaction_id,
          itd.item_title,
          itd.quantity,
          itd.collected_at,
          id.full_name,
          id.email,
          id.phone
         FROM item_donations itd
         JOIN individual_donors id ON itd.donor_id = id.id
         WHERE itd.id = ? AND itd.status = 'collected'`,
        [donationId]
      )

      if (itemDonations.length === 0) {
        throw new NotFoundError('Item donation not found or not collected')
      }

      donation = itemDonations[0] as ItemDonationDetail
      donationType = 'Item'
      itemDescription = donation.item_title
      quantity = donation.quantity
      amount = 0
    }

    // Generate receipt number
    const receiptNumber = `RCP-${donationType === 'UPI' ? 'UPI' : 'ITM'}-${String(donation.id).padStart(6, '0')}`

    // Prepare receipt data
    const receiptData = {
      receiptNumber,
      transactionId: donation.transaction_id,
      dateOfIssue: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      donorName: donation.full_name,
      donorEmail: donation.email,
      amount,
      paymentMode: donationType === 'UPI' ? 'UPI' : 'Item Donation',
      donationStatus: donationType === 'UPI' ? 'Approved' : 'Collected',
      donationType,
      itemDescription,
      quantity,
      isPreview: false
    }

    // Generate PDF
    const pdfBuffer = await generateDonationReceipt(receiptData)

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="donation-receipt-${receiptNumber}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    return handleError(error as Error)
  }
}
