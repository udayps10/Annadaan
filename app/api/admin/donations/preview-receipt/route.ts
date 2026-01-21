import { NextResponse } from 'next/server'
import { generateDonationReceipt } from '@/lib/pdfReceipt'

// Development-only endpoint to preview receipt with mock data
export async function GET() {
  try {
    // Mock data for preview
    const mockData = {
      receiptNumber: 'DEV-0001',
      dateOfIssue: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      donorName: 'Test User',
      donorEmail: 'test@example.com',
      amount: 500,
      paymentMode: 'UPI',
      donationStatus: 'Approved',
      donationType: 'UPI',
      isPreview: true // Adds SAMPLE watermark
    }

    // Generate PDF
    const pdfBuffer = await generateDonationReceipt(mockData)

    // Return PDF with proper headers for browser display
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview-receipt.pdf"',
        'Cache-Control': 'no-store'
      }
    })
  } catch (error) {
    console.error('Preview receipt error:', error)
    return NextResponse.json(
      { error: 'Failed to generate preview receipt' },
      { status: 500 }
    )
  }
}
