import { NextResponse } from 'next/server'
import { query } from '@/lib/database'
import { sendDonationReceipt, sendEmail } from '@/lib/email'
import { generateDonationReceipt } from '@/lib/pdfReceipt'

interface RouteParams {
  params: {
    id: string
    action: string
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { id, action } = params
    const body = await request.json()
    const { adminId } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Update UPI donation status
    const status = action === 'approve' ? 'approved' : 'rejected'
    
    // Get donor_id first
    const donationRows = await query('SELECT donor_id FROM upi_donations WHERE id = ?', [id])
    const donorId = donationRows[0]?.donor_id
    
    await query(
      `UPDATE upi_donations 
       SET status = ?, reviewed_at = NOW(), reviewed_by = ?
       WHERE id = ?`,
      [status, adminId || null, id]
    )

    // Log the action
    await query(
      `INSERT INTO donation_logs (donor_id, donation_type, donation_id, action, action_by) 
       VALUES (?, 'upi', ?, ?, ?)`,
      [donorId, id, action, adminId || null]
    )

    // If approved, send email receipt
    if (action === 'approve') {
      // Get donor details for receipt
      const donation = await query(
        `SELECT d.email, d.full_name, u.amount, u.created_at 
         FROM upi_donations u
         JOIN individual_donors d ON u.donor_id = d.id
         WHERE u.id = ?`,
        [id]
      ) as any[]

      if (donation.length > 0) {
        const { email, full_name, amount, created_at } = donation[0]
        
        // Validate amount
        if (!amount || amount <= 0) {
          console.error(`Invalid amount for UPI donation ${id}: ${amount}`)
          return NextResponse.json(
            { error: 'Invalid donation amount' },
            { status: 400 }
          )
        }
        
        // Generate PDF receipt
        const receiptNumber = `RCP-UPI-${String(id).padStart(6, '0')}`
        const receiptData = {
          receiptNumber,
          dateOfIssue: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          donorName: full_name,
          donorEmail: email,
          amount: parseFloat(amount),
          paymentMode: 'UPI',
          donationStatus: 'Approved',
          donationType: 'UPI',
          isPreview: false
        }

        const pdfBuffer = await generateDonationReceipt(receiptData)
        const pdfBase64 = pdfBuffer.toString('base64')

        // Send email with PDF receipt
        const emailResult = await sendEmail({
          to: email,
          subject: 'UPI Donation Approved - Receipt Attached',
          html: `
            <h2>✅ Your UPI Donation Has Been Approved!</h2>
            
            <p>Dear ${full_name},</p>
            
            <p>Thank you for your generous contribution of <strong>₹${amount}</strong> to Annadaan's Republic Day 2026 Donation Drive.</p>
            
            <h3>Donation Details:</h3>
            <ul>
              <li><strong>Amount:</strong> ₹${amount}</li>
              <li><strong>Payment Method:</strong> UPI</li>
              <li><strong>Receipt Number:</strong> ${receiptNumber}</li>
              <li><strong>Donation ID:</strong> #UPI${String(id).padStart(6, '0')}</li>
              <li><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}</li>
            </ul>
            
            <p><strong>📄 Your official donation receipt is attached to this email as a PDF.</strong></p>
            
            <p>Your contribution will directly help those in need through our food rescue and humanitarian relief initiatives.</p>
            
            <p>Thank you for making a difference!</p>
            
            <p>With gratitude,<br>
            <strong>Annadaan Team</strong><br>
            Republic Day 2026 Donation Drive</p>
          `,
          attachments: [{
            filename: `donation-receipt-${receiptNumber}.pdf`,
            content: pdfBase64,
            encoding: 'base64',
            contentType: 'application/pdf'
          }]
        })

        if (emailResult.success) {
          // Mark receipt as sent
          await query(
            `UPDATE upi_donations SET receipt_sent = 1 WHERE id = ?`,
            [id]
          )
          console.log(`Receipt sent successfully to ${email}`)
        } else {
          console.error(`Failed to send receipt to ${email}:`, emailResult.error)
          // Still mark as approved but receipt not sent
          await query(
            `UPDATE upi_donations SET receipt_sent = 0 WHERE id = ?`,
            [id]
          )
        }
      }
    }

    return NextResponse.json({
      message: `UPI donation ${action}d successfully${action === 'approve' ? ' and receipt sent to donor' : ''}`
    })

  } catch (error) {
    console.error('UPI donation action error:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}
