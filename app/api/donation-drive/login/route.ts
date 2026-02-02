import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { 
  handleError, 
  handleSuccess, 
  UnauthorizedError 
} from '@/lib/errors'
import { 
  validateFields, 
  validatePhone, 
  validateRequired 
} from '@/lib/validation'
import { sanitizePhone } from '@/lib/sanitization'
import { verifyPassword } from '@/lib/auth'
import { logInfo } from '@/lib/logger'

interface DonorRecord {
  id: number
  full_name: string
  email: string
  phone: string
  password_hash: string | null
  requires_password_update: boolean
  registration_date: Date
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password, aadhaarLast4 } = body

    // Validate phone
    validateFields([
      { result: validateRequired(phone, 'Phone number'), field: 'phone' },
      { result: validatePhone(phone), field: 'phone' }
    ])

    const sanitizedPhone = sanitizePhone(phone)

    // Try password-based authentication first (new method)
    if (password) {
      // Validate password is provided
      validateFields([
        { result: validateRequired(password, 'Password'), field: 'password' }
      ])

      // Find donor by phone
      const donors = await executeQuery<DonorRecord[]>(
        `SELECT id, full_name, email, phone, password_hash, requires_password_update, registration_date 
         FROM individual_donors 
         WHERE phone = ?`,
        [sanitizedPhone]
      )

      if (donors.length === 0) {
        throw new UnauthorizedError('Invalid credentials. Please check your phone number and password.')
      }

      const donor = donors[0]

      // Check if password is set
      if (!donor.password_hash) {
        throw new UnauthorizedError('Password not set. Please use Aadhaar authentication or contact support.')
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, donor.password_hash)
      
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid credentials. Please check your phone number and password.')
      }

      logInfo('Donor login successful (password)', { donorId: donor.id, phone: sanitizedPhone })

      return handleSuccess({
        donorId: donor.id,
        fullName: donor.full_name,
        email: donor.email,
        phone: donor.phone,
        registrationDate: donor.registration_date,
        requiresPasswordUpdate: false
      }, 'Login successful')
    }
    
    // Fall back to Aadhaar-based authentication (legacy method for existing users)
    if (aadhaarLast4) {
      // Validate aadhaar last 4 digits
      validateFields([
        { result: validateRequired(aadhaarLast4, 'Aadhaar last 4 digits'), field: 'aadhaarLast4' }
      ])

      if (!/^\d{4}$/.test(aadhaarLast4)) {
        validateFields([
          { result: { isValid: false, errors: ['Please enter last 4 digits of Aadhaar'] }, field: 'aadhaarLast4' }
        ])
      }

      // Find donor by phone and last 4 digits of Aadhaar
      const donors = await executeQuery<DonorRecord[]>(
        `SELECT id, full_name, email, phone, password_hash, requires_password_update, registration_date 
         FROM individual_donors 
         WHERE phone = ? AND RIGHT(aadhaar_number, 4) = ?`,
        [sanitizedPhone, aadhaarLast4]
      )

      if (donors.length === 0) {
        throw new UnauthorizedError('Invalid credentials. Please check your phone number and Aadhaar last 4 digits.')
      }

      const donor = donors[0]

      // Check if user needs to set up password
      const requiresPasswordUpdate = !donor.password_hash || donor.requires_password_update

      if (requiresPasswordUpdate) {
        // Mark this user as requiring password update if not already marked
        if (!donor.requires_password_update) {
          await executeQuery(
            'UPDATE individual_donors SET requires_password_update = 1 WHERE id = ?',
            [donor.id]
          )
        }
      }

      logInfo('Donor login successful (Aadhaar - legacy)', { 
        donorId: donor.id, 
        phone: sanitizedPhone,
        requiresPasswordUpdate 
      })

      return handleSuccess({
        donorId: donor.id,
        fullName: donor.full_name,
        email: donor.email,
        phone: donor.phone,
        registrationDate: donor.registration_date,
        requiresPasswordUpdate // Flag to redirect to password setup
      }, requiresPasswordUpdate 
        ? 'Login successful. Please set up your password for future logins.' 
        : 'Login successful')
    }

    // Neither password nor aadhaar provided
    throw new UnauthorizedError('Please provide either password or Aadhaar last 4 digits.')

  } catch (error) {
    return handleError(error as Error)
  }
}

