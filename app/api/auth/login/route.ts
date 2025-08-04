import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Find user (matching the database schema)
    const users = await executeQuery(
      'SELECT id, email, password, full_name, role, status FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (users.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Generate token (using role)
    const token = generateToken(user.id, user.role);

    // Check user status and return appropriate response
    if (user.status === 'pending') {
      return NextResponse.json({
        message: 'Account pending verification',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          full_name: user.full_name,
          role: user.role,
          status: user.status
        },
        requiresVerification: true
      });
    } else if (user.status === 'rejected') {
      return NextResponse.json({ 
        message: 'Account has been rejected. Please contact support.' 
      }, { status: 403 });
    } else if (user.status === 'suspended') {
      return NextResponse.json({ 
        message: 'Account has been suspended. Please contact support.' 
      }, { status: 403 });
    }

    // User is approved, normal login
    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        full_name: user.full_name,
        role: user.role,
        status: user.status
      },
      requiresVerification: false
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Login failed' }, { status: 500 });
  }
}
