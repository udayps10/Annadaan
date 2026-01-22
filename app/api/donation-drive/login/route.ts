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
import { logInfo } from '@/lib/logger'

interface DonorRecord {
  id: number
  full_name: string
  email: string
  phone: string
  registration_date: Date
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, aadhaarLast4 } = body

    // Validate inputs
    validateFields([
      { result: validateRequired(phone, 'Phone number'), field: 'phone' },
      { result: validateRequired(aadhaarLast4, 'Aadhaar last 4 digits'), field: 'aadhaarLast4' },
      { result: validatePhone(phone), field: 'phone' }
    ])

    // Validate aadhaar last 4 digits
    if (!/^\d{4}$/.test(aadhaarLast4)) {
      validateFields([
        { result: { isValid: false, errors: ['Please enter last 4 digits of Aadhaar'] }, field: 'aadhaarLast4' }
      ])
    }

    const sanitizedPhone = sanitizePhone(phone)

    // Find donor by phone and last 4 digits of Aadhaar
    const donors = await executeQuery<DonorRecord[]>(
      `SELECT id, full_name, email, phone, registration_date 
       FROM individual_donors 
       WHERE phone = ? AND RIGHT(aadhaar_number, 4) = ?`,
      [sanitizedPhone, aadhaarLast4]
    )

    if (donors.length === 0) {
      throw new UnauthorizedError('Invalid credentials. Please check your phone number and Aadhaar last 4 digits.')
    }

    const donor = donors[0]
    
    logInfo('Donor login successful', { donorId: donor.id, phone: sanitizedPhone })

    return handleSuccess({
      donorId: donor.id,
      fullName: donor.full_name,
      email: donor.email,
      phone: donor.phone,
      registrationDate: donor.registration_date
    }, 'Login successful')

  } catch (error) {
    return handleError(error as Error)
  }
}

