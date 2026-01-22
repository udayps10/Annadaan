/**
 * Donor Registration Endpoint
 * Handles individual donor registration for donation drive
 */

import { NextRequest } from 'next/server'
import { executeQuery } from '@/lib/database'
import { 
  handleError, 
  handleSuccess, 
  ConflictError,
  ValidationError,
  logInfo 
} from '@/lib/errors'
import { 
  validateFields, 
  validateRequired, 
  validateEmail, 
  validatePhone,
  validateName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeString 
} from '@/lib/validation'
import { HTTP_STATUS } from '@/lib/config'

interface DonorRegistration {
  fullName: string
  phone: string
  email: string
  aadhaarNumber: string
}

interface ExistingDonor {
  id: number
}

export async function POST(request: NextRequest) {
  try {
    const body: DonorRegistration = await request.json()

    // Validate all required fields
    validateFields([
      { result: validateRequired(body.fullName, 'Full name'), field: 'fullName' },
      { result: validateRequired(body.phone, 'Phone'), field: 'phone' },
      { result: validateRequired(body.email, 'Email'), field: 'email' },
      { result: validateRequired(body.aadhaarNumber, 'Aadhaar number'), field: 'aadhaarNumber' },
      { result: validateName(body.fullName, 'Full name'), field: 'fullName' },
      { result: validatePhone(body.phone), field: 'phone' },
      { result: validateEmail(body.email), field: 'email' },
    ])

    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(body.aadhaarNumber)) {
      throw new ValidationError('Aadhaar number must be exactly 12 digits')
    }

    // Sanitize inputs
    const fullName = sanitizeString(body.fullName)
    const phone = sanitizePhone(body.phone)
    const email = sanitizeEmail(body.email)
    const aadhaarNumber = body.aadhaarNumber.trim()

    // Check if email already exists
    const existingEmail = await executeQuery<ExistingDonor[]>(
      'SELECT id FROM individual_donors WHERE email = ?',
      [email]
    )

    if (existingEmail.length > 0) {
      throw new ConflictError('This email is already registered', {
        donorId: existingEmail[0].id
      })
    }

    // Check if Aadhaar already exists
    const existingAadhaar = await executeQuery<ExistingDonor[]>(
      'SELECT id FROM individual_donors WHERE aadhaar_number = ?',
      [aadhaarNumber]
    )

    if (existingAadhaar.length > 0) {
      throw new ConflictError('This Aadhaar number is already registered', {
        donorId: existingAadhaar[0].id
      })
    }

    // Insert new donor
    const result = await executeQuery<any>(
      `INSERT INTO individual_donors (full_name, phone, email, aadhaar_number, registration_date) 
       VALUES (?, ?, ?, ?, NOW())`,
      [fullName, phone, email, aadhaarNumber]
    )

    const donorId = result.insertId

    logInfo('New donor registered', { donorId, email })

    return handleSuccess({
      donorId,
      fullName,
      email,
      phone
    }, 'Registration successful. You can now make donations!', HTTP_STATUS.CREATED)

  } catch (error) {
    return handleError(error as Error)
  }
}
