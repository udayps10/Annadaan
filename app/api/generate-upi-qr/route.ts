import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

// Fixed UPI configuration
const UPI_CONFIG = {
  upiId: 'raunaksingh11@sbi',
  payeeName: 'Donation Drive',
  currency: 'INR'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, includeAmount = true } = body

    // Validate amount only if includeAmount is true
    if (includeAmount) {
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { error: 'Invalid amount. Must be a positive number.' },
          { status: 400 }
        )
      }

      // Prevent unreasonably large amounts (security check)
      if (amount > 100000) {
        return NextResponse.json(
          { error: 'Amount exceeds maximum limit of ₹1,00,000' },
          { status: 400 }
        )
      }
    }

    // Construct UPI payment URL based on mode
    const upiUrl = includeAmount 
      ? constructUPIUrl(UPI_CONFIG.upiId, UPI_CONFIG.payeeName, amount, UPI_CONFIG.currency)
      : constructUPIUrlWithoutAmount(UPI_CONFIG.upiId, UPI_CONFIG.payeeName, UPI_CONFIG.currency)

    // Generate QR code as base64
    const qrCodeBase64 = await QRCode.toDataURL(upiUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2
    })

    return NextResponse.json({
      success: true,
      qrCode: qrCodeBase64,
      upiUrl: upiUrl,
      amount: includeAmount ? amount : null,
      upiId: UPI_CONFIG.upiId,
      payeeName: UPI_CONFIG.payeeName,
      includeAmount: includeAmount,
      bankLimitGuidance: includeAmount ? 
        "If you see 'Bank limit exceeded', please try:  (1) Scanning the QR code" :
        "Enter your preferred amount in the UPI app after opening the link"
    })

  } catch (error) {
    console.error('UPI QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate UPI QR code' },
      { status: 500 }
    )
  }
}

/**
 * Constructs a UPI payment URL following the official UPI scheme
 * @param upiId - UPI ID of the payee
 * @param payeeName - Name of the payee
 * @param amount - Payment amount
 * @param currency - Currency code (default: INR)
 * @returns Properly encoded UPI URL
 */
function constructUPIUrl(
  upiId: string,
  payeeName: string,
  amount: number,
  currency: string = 'INR'
): string {
  // UPI URL scheme: upi://pay?pa=<UPI_ID>&pn=<PAYEE_NAME>&am=<AMOUNT>&cu=<CURRENCY>
  
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: currency
  })

  return `upi://pay?${params.toString()}`
}

/**
 * Constructs a UPI payment URL WITHOUT amount (user enters in app)
 * @param upiId - UPI ID of the payee
 * @param payeeName - Name of the payee
 * @param currency - Currency code (default: INR)
 * @returns Properly encoded UPI URL without amount
 */
function constructUPIUrlWithoutAmount(
  upiId: string,
  payeeName: string,
  currency: string = 'INR'
): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    cu: currency
  })

  return `upi://pay?${params.toString()}`
}
