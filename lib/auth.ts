/**
 * Authentication Utilities
 * Password hashing and verification
 * Note: JWT functions moved to lib/middleware.ts for better organization
 */

import bcrypt from 'bcryptjs';
import { AUTH_CONFIG } from './config';

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_CONFIG.bcryptRounds);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Re-export JWT functions from middleware for backward compatibility
export { verifyToken, generateToken, type JWTPayload } from './middleware';
