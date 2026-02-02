/**
 * Setup Password Endpoint
 * Allows existing donors (who used Aadhaar authentication) to set their password
 */

import { NextRequest } from 'next/server'
import { executeQuery } from '@/lib/database'
import { 
  handleError, 
  handleSuccess, 
  UnauthorizedError,
  ValidationError,
  NotFoundError
} from '@/lib/errors'
import { 
  validateFields, 
  validateRequired 
} from '@/lib/validation'
import { hashPassword } from '@/lib/auth'
import { logInfo } from '@/lib/logger'

interface DonorRecord {
  id: number
  full_name: string
  requires_password_update: boolean
  password_hash: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { donorId, password, confirmPassword } = body

    // Validate inputs
    validateFields([
      { result: validateRequired(donorId, 'Donor ID'), field: 'donorId' },
      { result: validateRequired(password, 'Password'), field: 'password' },
      { result: validateRequired(confirmPassword, 'Confirm Password'), field: 'confirmPassword' }
    ])

    // Validate password match
    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match')
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long')
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    }

    // Find donor
    const donors = await executeQuery<DonorRecord[]>(
      'SELECT id, full_name, requires_password_update, password_hash FROM individual_donors WHERE id = ?',
      [donorId]
    )

    if (donors.length === 0) {
      throw new NotFoundError('Donor not found')
    }

    const donor = donors[0]

    // Hash the new password
    const passwordHash = await hashPassword(password)

    // Update donor with new password and clear the flag
    await executeQuery(
      `UPDATE individual_donors 
       SET password_hash = ?, requires_password_update = 0, updated_at = NOW()
       WHERE id = ?`,
      [passwordHash, donorId]
    )

    logInfo('Donor password set successfully', { donorId })

    return handleSuccess({
      donorId: donor.id,
      fullName: donor.full_name
    }, 'Password set successfully. You can now login with your phone number and password.')

  } catch (error) {
    return handleError(error as Error)
  }
}
