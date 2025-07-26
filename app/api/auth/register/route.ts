import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    // Validate required fields
    if (!email || !password || !name || !role) {
      return NextResponse.json({ 
        message: 'Missing required fields: email, password, name, and role are required' 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUser.length > 0) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user (matching the database schema)
    const userResult = await executeQuery(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    ) as any;

    const userId = userResult.insertId;

    // Generate token
    const token = generateToken(userId, role);

    return NextResponse.json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Registration failed' }, { status: 500 });
  }
}
