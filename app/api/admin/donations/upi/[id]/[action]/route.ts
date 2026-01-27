/**
 * Admin UPI Donation Action Endpoint
 * Handles approval/rejection of UPI donations with email receipts
 */

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeInTransaction } from '@/lib/database'
import { sendDonationReceipt, sendEmail } from '@/lib/email'
import { generateDonationReceipt } from '@/lib/pdfReceipt'
import { 
  handleError, 
  handleSuccess, 
  ValidationError,
  NotFoundError
} from '@/lib/errors'
import { 
  validateEnum,
  validateFields,
  parseInteger 
} from '@/lib/validation'
import { createAuthContext } from '@/lib/middleware'
import { HTTP_STATUS } from '@/lib/config'
import { logInfo, logError } from '@/lib/logger'

interface RouteParams {
  params: {
    id: string
    action: string
  }
}

interface DonationRecord {
  id: number
  donor_id: number
  amount: number
  transaction_id: string
  email: string
  full_name: string
  created_at: Date
}

const ALLOWED_ACTIONS = ['approve', 'reject'] as const

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Authenticate and require admin role
    const auth = createAuthContext(request)
    auth.requireAdmin()

    const { id, action } = params

    // Validate action
    validateFields([
      { result: validateEnum(action, ALLOWED_ACTIONS, 'Action'), field: 'action' }
    ])

    const donationId = parseInteger(id, 'Donation ID')
    const adminId = auth.user.userId
    const status = action === 'approve' ? 'approved' : 'rejected'

    // Execute in transaction for data integrity
    await executeInTransaction(async (connection) => {
      // Get donation details
      const [donations] = await connection.execute(
        'SELECT donor_id FROM upi_donations WHERE id = ?',
        [donationId]
      )
      
      const donationData = donations as any[]
      if (donationData.length === 0) {
        throw new NotFoundError('Donation not found')
      }

      const donorId = donationData[0].donor_id

      // Update donation status
      await connection.execute(
        `UPDATE upi_donations 
         SET status = ?, reviewed_at = NOW()
         WHERE id = ?`,
        [status, donationId]
      )

      // Log the action (without action_by since admin ID doesn't exist in users table)
      await connection.execute(
        `INSERT INTO donation_logs (donor_id, donation_type, donation_id, action) 
         VALUES (?, 'upi', ?, ?)`,
        [donorId, donationId, action]
      )
    })

    // If approved, send email receipt
    if (action === 'approve') {
      // Get complete donation details for receipt
      const donations = await executeQuery<DonationRecord[]>(
        `SELECT u.id, u.donor_id, u.amount, u.transaction_id, u.created_at,
                d.email, d.full_name
         FROM upi_donations u
         JOIN individual_donors d ON u.donor_id = d.id
         WHERE u.id = ?`,
        [donationId]
      )

      if (donations.length > 0) {
        const donation = donations[0]
        
        // Validate amount
        if (!donation.amount || donation.amount <= 0) {
          throw new ValidationError(`Invalid donation amount: ${donation.amount}`)
        }
        
        // Generate PDF receipt
        const receiptNumber = `RCP-UPI-${String(donationId).padStart(6, '0')}`
        const receiptData = {
          receiptNumber,
          dateOfIssue: new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          donorName: donation.full_name,
          donorEmail: donation.email,
          amount: parseFloat(String(donation.amount)),
          paymentMode: 'UPI',
          donationStatus: 'Approved',
          donationType: 'UPI',
          transactionId: donation.transaction_id,
          isPreview: false
        }

        const pdfBuffer = await generateDonationReceipt(receiptData)
        const pdfBase64 = pdfBuffer.toString('base64')

        // Send email with PDF receipt
        const emailResult = await sendEmail({
          to: donation.email,
          subject: 'UPI Donation Approved - Receipt Attached',
          html: `
            <h2>✅ Your UPI Donation Has Been Approved!</h2>
            
            <p>Dear ${donation.full_name},</p>
            
            <p>Thank you for your generous contribution of <strong>Rs. ${donation.amount}</strong> to Annadaan's Republic Day 2026 Donation Drive.</p>
            
            <h3>Donation Details:</h3>
            <ul>
              <li><strong>Amount:</strong> Rs. ${donation.amount}</li>
              <li><strong>Payment Method:</strong> UPI</li>
              <li><strong>Receipt Number:</strong> ${receiptNumber}</li>
              <li><strong>Transaction ID:</strong> ${donation.transaction_id}</li>
              <li><strong>Donation ID:</strong> #UPI${String(donationId).padStart(6, '0')}</li>
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
            encoding: 'base64'
          }]
        })

        // Update receipt sent status
        try {
          if (emailResult.success) {
            await executeQuery(
              `UPDATE upi_donations SET receipt_sent = 1 WHERE id = ?`,
              [donationId]
            )
            logInfo(`Receipt sent successfully to ${donation.email}`)
          } else {
            await executeQuery(
              `UPDATE upi_donations SET receipt_sent = 0 WHERE id = ?`,
              [donationId]
            )
            logError('Email sending failed', { error: emailResult.error, email: donation.email })
          }
        } catch (emailError) {
          // Log but don't fail the approval - donation is already approved
          logError('Failed to update receipt status', { error: emailError })
        }
      }
    }

    return handleSuccess(
      null,
      `UPI donation ${action}d successfully${action === 'approve' ? ' and receipt sent to donor' : ''}`
    )

  } catch (error) {
    return handleError(error as Error)
  }
}
