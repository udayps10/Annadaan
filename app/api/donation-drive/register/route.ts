import { NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fullName, phone, email, aadhaarNumber } = body

    // Validation
    if (!fullName || !phone || !email || !aadhaarNumber) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate Aadhaar format
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return NextResponse.json(
        { error: 'Aadhaar number must be 12 digits' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await query(
      'SELECT id FROM individual_donors WHERE email = ?',
      [email]
    ) as any[]

    if (existingEmail.length > 0) {
      return NextResponse.json(
        { 
          error: 'This email is already registered',
          donorId: existingEmail[0].id 
        },
        { status: 409 }
      )
    }

    // Check if Aadhaar already exists
    const existingAadhaar = await query(
      'SELECT id FROM individual_donors WHERE aadhaar_number = ?',
      [aadhaarNumber]
    ) as any[]

    if (existingAadhaar.length > 0) {
      return NextResponse.json(
        { 
          error: 'This Aadhaar number is already registered',
          donorId: existingAadhaar[0].id 
        },
        { status: 409 }
      )
    }

    // Insert new donor
    const result = await query(
      `INSERT INTO individual_donors (full_name, phone, email, aadhaar_number, registration_date) 
       VALUES (?, ?, ?, ?, NOW())`,
      [fullName, phone, email, aadhaarNumber]
    ) as any

    return NextResponse.json({
      message: 'Registration successful',
      donorId: result.insertId
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register donor. Please try again.' },
      { status: 500 }
    )
  }
}
