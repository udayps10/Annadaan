/**
 * UPI Donation Submission Endpoint
 * Handles UPI payment screenshot submissions with transaction ID generation
 */

import { NextRequest } from 'next/server'
import { executeQuery, executeInTransaction } from '@/lib/database'
import { 
  handleError, 
  handleSuccess, 
  NotFoundError,
  logInfo 
} from '@/lib/errors'
import { 
  validateFields, 
  validateRequired, 
  validateDonationAmount,
  parseInteger 
} from '@/lib/validation'
import { HTTP_STATUS, DONATION_CONFIG } from '@/lib/config'

interface UPIDonationRequest {
  donorId: number
  paymentScreenshot: string
  amount: number | string
}

interface DonorRecord {
  id: number
}

export async function POST(request: NextRequest) {
  try {
    const body: UPIDonationRequest = await request.json()

    // Validate required fields
    validateFields([
      { result: validateRequired(body.donorId, 'Donor ID'), field: 'donorId' },
      { result: validateRequired(body.paymentScreenshot, 'Payment screenshot'), field: 'paymentScreenshot' },
      { result: validateRequired(body.amount, 'Amount'), field: 'amount' },
      { result: validateDonationAmount(body.amount), field: 'amount' },
    ])

    const donorId = parseInteger(body.donorId, 'Donor ID')
    const donationAmount = typeof body.amount === 'string' ? parseFloat(body.amount) : body.amount

    // Verify donor exists
    const donor = await executeQuery<DonorRecord[]>(
      'SELECT id FROM individual_donors WHERE id = ?',
      [donorId]
    )

    if (donor.length === 0) {
      throw new NotFoundError('Invalid donor ID. Please register first.')
    }

    // Generate unique transaction ID
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    const transactionId = `${DONATION_CONFIG.transactionIdPrefix.upi}-${dateStr}-${timeStr}-${randomStr}`

    // Execute in transaction for data integrity
    const result = await executeInTransaction(async (connection) => {
      // Insert UPI donation
      const [donationResult] = await connection.execute(
        `INSERT INTO upi_donations (donor_id, amount, transaction_id, payment_screenshot, status) 
         VALUES (?, ?, ?, ?, 'pending')`,
        [donorId, donationAmount, transactionId, body.paymentScreenshot]
      )
      const donationId = (donationResult as any).insertId

      // Log the action
      await connection.execute(
        `INSERT INTO donation_logs (donor_id, donation_type, donation_id, action) 
         VALUES (?, 'upi', ?, 'submitted')`,
        [donorId, donationId]
      )

      return { donationId, transactionId }
    })

    logInfo('UPI donation submitted', { donorId, transactionId, amount: donationAmount })

    return handleSuccess(result, 'UPI donation submitted successfully. Pending admin approval.', HTTP_STATUS.CREATED)

  } catch (error) {
    return handleError(error as Error)
  }
}
