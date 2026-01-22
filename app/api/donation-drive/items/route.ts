/**
 * Item Donation Submission Endpoint
 * Handles item donation requests with pickup scheduling
 */

import { NextRequest } from 'next/server'
import { executeQuery, executeInTransaction } from '@/lib/database'
import { 
  handleError, 
  handleSuccess, 
  NotFoundError,
  ValidationError,
  logInfo 
} from '@/lib/errors'
import { 
  validateFields, 
  validateRequired,
  sanitizeString,
  parseInteger 
} from '@/lib/validation'
import { HTTP_STATUS, DONATION_CONFIG } from '@/lib/config'

interface ItemDonationRequest {
  donorId: number
  itemTitle: string
  quantity: number | string
  pickupDatetime: string
  pickupAddress: string
}

interface DonorRecord {
  id: number
}

export async function POST(request: NextRequest) {
  try {
    const body: ItemDonationRequest = await request.json()

    // Validate all required fields
    validateFields([
      { result: validateRequired(body.donorId, 'Donor ID'), field: 'donorId' },
      { result: validateRequired(body.itemTitle, 'Item title'), field: 'itemTitle' },
      { result: validateRequired(body.quantity, 'Quantity'), field: 'quantity' },
      { result: validateRequired(body.pickupDatetime, 'Pickup date and time'), field: 'pickupDatetime' },
      { result: validateRequired(body.pickupAddress, 'Pickup address'), field: 'pickupAddress' },
    ])

    const donorId = parseInteger(body.donorId, 'Donor ID')
    const quantity = parseInteger(body.quantity, 'Quantity')
    const itemTitle = sanitizeString(body.itemTitle)
    const pickupAddress = sanitizeString(body.pickupAddress)

    // Verify donor exists
    const donor = await executeQuery<DonorRecord[]>(
      'SELECT id FROM individual_donors WHERE id = ?',
      [donorId]
    )

    if (donor.length === 0) {
      throw new NotFoundError('Invalid donor ID. Please register first.')
    }

    // Validate pickup datetime is not in the past
    const pickupDate = new Date(body.pickupDatetime)
    if (isNaN(pickupDate.getTime())) {
      throw new ValidationError('Invalid pickup date format')
    }
    if (pickupDate < new Date()) {
      throw new ValidationError('Pickup datetime cannot be in the past')
    }

    // Generate unique transaction ID
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    const transactionId = `${DONATION_CONFIG.transactionIdPrefix.item}-${dateStr}-${timeStr}-${randomStr}`

    // Execute in transaction for data integrity
    const result = await executeInTransaction(async (connection) => {
      // Insert item donation
      const [donationResult] = await connection.execute(
        `INSERT INTO item_donations (donor_id, transaction_id, item_title, quantity, pickup_datetime, pickup_address, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [donorId, transactionId, itemTitle, quantity, body.pickupDatetime, pickupAddress]
      )
      const donationId = (donationResult as any).insertId

      // Log the action
      await connection.execute(
        `INSERT INTO donation_logs (donor_id, donation_type, donation_id, action) 
         VALUES (?, 'item', ?, 'submitted')`,
        [donorId, donationId]
      )

      return { donationId, transactionId }
    })

    logInfo('Item donation submitted', { donorId, transactionId, itemTitle, quantity })

    return handleSuccess(result, 'Item donation request submitted successfully. Pending admin approval.', HTTP_STATUS.CREATED)

  } catch (error) {
    return handleError(error as Error)
  }
}
