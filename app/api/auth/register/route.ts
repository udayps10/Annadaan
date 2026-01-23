import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      password, 
      name, 
      role, 
      phone, 
      address, 
      full_name,
      // Vendor specific
      businessName,
      businessType,
      businessDescription,
      website,
      averageDailyAvailable,
      // NGO specific
      organizationName,
      registrationNumber,
      focusArea,
      capacity,
      serviceAreaRadius,
      areaOfOperation,
      organizationDescription
    } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !role || !phone) {
      return NextResponse.json({ 
        success: false,
        message: 'Missing required fields: email, password, name, role, and phone are required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid email format' 
      }, { status: 400 });
    }

    // Validate phone format (10 digits for Indian numbers)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid phone number. Must be a valid 10-digit Indian mobile number' 
      }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ 
        success: false,
        message: 'Password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Validate role
    if (!['vendor', 'ngo', 'admin'].includes(role)) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid role. Must be vendor, ngo, or admin' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        success: false,
        message: 'This email is already registered. Please use a different email or login.' 
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Start with pending status for all users (we can update admin users later)
    const userStatus = 'pending';

    // Insert user (matching actual database schema)
    const userResult = await executeQuery(
      'INSERT INTO users (name, full_name, email, password, role, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, name, email, hashedPassword, role, phone, address, userStatus]
    ) as any;

    const userId = userResult.insertId;

    // Create role-specific profile (skip for admin users)
    if (role === 'vendor') {
      await executeQuery(
        'INSERT INTO vendor_profiles (user_id, business_name, business_type, address, phone, description, website, average_daily_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          businessName || null,
          businessType || 'other',
          address || null,
          phone || null,
          businessDescription || null,
          website || null,
          averageDailyAvailable || 0
        ]
      );
    } else if (role === 'ngo') {
      await executeQuery(
        'INSERT INTO ngo_profiles (user_id, organization_name, registration_number, focus_area, capacity, address, phone, description, service_area_radius, area_of_operation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          organizationName || null,
          registrationNumber || null,
          focusArea || 'general',
          capacity || 50,
          address || null,
          phone || null,
          organizationDescription || null,
          serviceAreaRadius || 10,
          areaOfOperation || null
        ]
      );
    }

    // Generate token with payload object
    const token = generateToken({
      userId,
      email,
      role
    });

    // If it's an admin user, we can update their status to approved immediately after creation
    if (role === 'admin') {
      await executeQuery(
        'UPDATE users SET status = ? WHERE id = ?',
        ['approved', userId]
      );
    }

    // Different messages for admin vs others
    const message = role === 'admin' 
      ? 'Admin account created successfully!'
      : 'User registered successfully. Please complete document verification.';

    return NextResponse.json({
      success: true,
      message,
      token,
      user: {
        id: userId,
        email,
        name,
        role,
        status: role === 'admin' ? 'approved' : userStatus
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Extract proper error message
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage?.includes('email')) {
        errorMessage = 'This email is already registered.';
      } else if (error.sqlMessage?.includes('phone')) {
        errorMessage = 'This phone number is already registered.';
      } else {
        errorMessage = 'This account already exists.';
      }
    } else if (error.code === 'ER_DATA_TOO_LONG') {
      errorMessage = 'One or more fields exceed the maximum length.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false,
      message: errorMessage 
    }, { status: 500 });
  }
}
