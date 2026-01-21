import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, aadhaarLast4 } = body

    // Validate inputs
    if (!phone || !aadhaarLast4) {
      return NextResponse.json(
        { error: 'Phone number and Aadhaar last 4 digits are required' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      )
    }

    // Validate aadhaar last 4 digits
    if (!/^\d{4}$/.test(aadhaarLast4)) {
      return NextResponse.json(
        { error: 'Please enter last 4 digits of Aadhaar' },
        { status: 400 }
      )
    }

    // Find donor by phone and last 4 digits of Aadhaar
    const donors = await query(
      `SELECT id, full_name, email, phone, registration_date 
       FROM individual_donors 
       WHERE phone = ? AND RIGHT(aadhaar_number, 4) = ?`,
      [phone, aadhaarLast4]
    )

    if (!donors || donors.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials. Please check your phone number and Aadhaar last 4 digits.' },
        { status: 401 }
      )
    }

    const donor = donors[0]

    return NextResponse.json({
      success: true,
      donorId: donor.id,
      fullName: donor.full_name,
      email: donor.email,
      phone: donor.phone,
      registrationDate: donor.registration_date,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Donor login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
