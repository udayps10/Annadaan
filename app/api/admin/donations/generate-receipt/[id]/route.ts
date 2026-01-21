import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { generateDonationReceipt } from '@/lib/pdfReceipt'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params
    const url = new URL(request.url)
    const type = url.searchParams.get('type') || 'item' // 'item' or 'upi'
    const donationId = parseInt(id)

    if (isNaN(donationId)) {
      return NextResponse.json({ error: 'Invalid donation ID' }, { status: 400 })
    }

    let donation: any
    let donationType: string
    let amount: number = 0
    let itemDescription: string | undefined
    let quantity: number | undefined

    if (type === 'upi') {
      // Fetch UPI donation details
      const upiDonations = await query(
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
      ) as any[]

      if (upiDonations.length === 0) {
        return NextResponse.json(
          { error: 'UPI donation not found or not approved' },
          { status: 404 }
        )
      }

      donation = upiDonations[0]
      donationType = 'UPI'
      amount = parseFloat(donation.amount) || 0
    } else {
      // Fetch Item donation details
      const itemDonations = await query(
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
      ) as any[]

      if (itemDonations.length === 0) {
        return NextResponse.json(
          { error: 'Item donation not found or not collected' },
          { status: 404 }
        )
      }

      donation = itemDonations[0]
      donationType = 'Item'
      itemDescription = donation.item_title
      quantity = donation.quantity
      // For item donations, we don't have monetary value, use symbolic amount
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
    console.error('Generate receipt error:', error)
    return NextResponse.json(
      { error: 'Failed to generate receipt' },
      { status: 500 }
    )
  }
}
