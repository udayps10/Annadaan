/**
 * Authentication Login Endpoint
 * Handles user login with email and password
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { verifyPassword, generateToken } from '@/lib/auth';
import { 
  handleError, 
  handleSuccess, 
  ValidationError, 
  AuthenticationError,
  AuthorizationError,
  logInfo 
} from '@/lib/errors';
import { 
  validateEmail, 
  validateRequired, 
  validateFields,
  sanitizeEmail 
} from '@/lib/validation';
import { HTTP_STATUS } from '@/lib/config';
import { generateToken as generateJWT, UserRole } from '@/lib/middleware';

interface LoginRequest {
  email: string;
  password: string;
}

interface UserRecord {
  id: number;
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: LoginRequest = await request.json();
    
    // Validate inputs
    validateFields([
      { result: validateRequired(body.email, 'Email'), field: 'email' },
      { result: validateRequired(body.password, 'Password'), field: 'password' },
      { result: validateEmail(body.email || ''), field: 'email' },
    ]);

    // Sanitize email
    const email = sanitizeEmail(body.email);
    const password = body.password;

    // Find user by email
    const users = await executeQuery<UserRecord[]>(
      'SELECT id, email, password, full_name, role, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check account status
    if (user.status === 'rejected') {
      throw new AuthorizationError('Account has been rejected. Please contact support.');
    }

    if (user.status === 'suspended') {
      throw new AuthorizationError('Account has been suspended. Please contact support.');
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log successful login
    logInfo('User logged in successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Prepare response data
    const responseData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        full_name: user.full_name,
        role: user.role,
        status: user.status,
      },
      requiresVerification: user.status === 'pending',
    };

    // Return success response
    return handleSuccess(
      responseData,
      user.status === 'pending' 
        ? 'Account pending verification' 
        : 'Login successful',
      HTTP_STATUS.OK
    );

  } catch (error) {
    return handleError(error as Error);
  }
}
