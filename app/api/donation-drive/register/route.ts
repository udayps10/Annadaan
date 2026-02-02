/**
 * Donor Registration Endpoint
 * Handles individual donor registration for donation drive
 * Supports password-based authentication (new) with optional Aadhaar (legacy)
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
import { hashPassword } from '@/lib/auth'
import { HTTP_STATUS } from '@/lib/config'

interface DonorRegistration {
  fullName: string
  phone: string
  email: string
  password: string
  aadhaarNumber?: string // Now optional for new registrations
}

interface ExistingDonor {
  id: number
}

export async function POST(request: NextRequest) {
  try {
    const body: DonorRegistration = await request.json()

    // Validate all required fields
    const validations = [
      { result: validateRequired(body.fullName, 'Full name'), field: 'fullName' },
      { result: validateRequired(body.phone, 'Phone'), field: 'phone' },
      { result: validateRequired(body.email, 'Email'), field: 'email' },
      { result: validateRequired(body.password, 'Password'), field: 'password' },
      { result: validateName(body.fullName, 'Full name'), field: 'fullName' },
      { result: validatePhone(body.phone), field: 'phone' },
      { result: validateEmail(body.email), field: 'email' },
    ]

    // Validate password strength
    if (body.password) {
      if (body.password.length < 8) {
        validations.push({
          result: { isValid: false, errors: ['Password must be at least 8 characters long'] },
          field: 'password'
        })
      }
      // Optional: Add more password strength requirements
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(body.password)) {
        validations.push({
          result: { isValid: false, errors: ['Password must contain at least one uppercase letter, one lowercase letter, and one number'] },
          field: 'password'
        })
      }
    }

    validateFields(validations)

    // Validate Aadhaar format if provided (optional for new users, for backward compatibility)
    if (body.aadhaarNumber && !/^\d{12}$/.test(body.aadhaarNumber)) {
      throw new ValidationError('Aadhaar number must be exactly 12 digits')
    }

    // Sanitize inputs
    const fullName = sanitizeString(body.fullName)
    const phone = sanitizePhone(body.phone)
    const email = sanitizeEmail(body.email)
    const aadhaarNumber = body.aadhaarNumber ? body.aadhaarNumber.trim() : null

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

    // Check if phone already exists
    const existingPhone = await executeQuery<ExistingDonor[]>(
      'SELECT id FROM individual_donors WHERE phone = ?',
      [phone]
    )

    if (existingPhone.length > 0) {
      throw new ConflictError('This phone number is already registered', {
        donorId: existingPhone[0].id
      })
    }

    // Check if Aadhaar already exists (if provided)
    if (aadhaarNumber) {
      const existingAadhaar = await executeQuery<ExistingDonor[]>(
        'SELECT id FROM individual_donors WHERE aadhaar_number = ?',
        [aadhaarNumber]
      )

      if (existingAadhaar.length > 0) {
        throw new ConflictError('This Aadhaar number is already registered', {
          donorId: existingAadhaar[0].id
        })
      }
    }

    // Hash the password
    const passwordHash = await hashPassword(body.password)

    // Insert new donor with password
    const result = await executeQuery<any>(
      `INSERT INTO individual_donors 
       (full_name, phone, email, aadhaar_number, password_hash, requires_password_update, registration_date) 
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [fullName, phone, email, aadhaarNumber, passwordHash]
    )

    const donorId = result.insertId

    logInfo('New donor registered with password', { donorId, email })

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
