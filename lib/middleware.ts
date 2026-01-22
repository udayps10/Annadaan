/**
 * Authentication and Authorization Middleware
 * Provides JWT verification and role-based access control
 */

import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { AUTH_CONFIG } from './config';
import { AuthenticationError, AuthorizationError } from './errors';

/**
 * User roles
 */
export enum UserRole {
  VENDOR = 'vendor',
  NGO = 'ngo',
  ADMIN = 'admin',
  DONOR = 'donor',
}

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * Authenticated request with user data
 */
export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload;
}

/**
 * Extract token from request
 */
function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Fallback to query parameter (for backward compatibility)
  const token = request.nextUrl.searchParams.get('token');
  return token;
}

/**
 * Verify JWT token and extract payload
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, AUTH_CONFIG.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthenticationError('Token has expired. Please log in again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token. Please log in again.');
    }
    throw new AuthenticationError('Authentication failed.');
  }
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload as object, AUTH_CONFIG.jwtSecret, {
    expiresIn: AUTH_CONFIG.jwtExpiresIn,
  } as jwt.SignOptions);
}

/**
 * Authenticate request and extract user data
 */
export function authenticateRequest(request: NextRequest): JWTPayload {
  const token = extractToken(request);

  if (!token) {
    throw new AuthenticationError('No authentication token provided.');
  }

  return verifyToken(token);
}

/**
 * Require authentication middleware
 */
export function requireAuth(request: NextRequest): JWTPayload {
  return authenticateRequest(request);
}

/**
 * Require specific role(s)
 */
export function requireRole(user: JWTPayload, allowedRoles: UserRole | UserRole[]): void {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  if (!roles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied. Required role: ${roles.join(' or ')}.`
    );
  }
}

/**
 * Check if user has role
 */
export function hasRole(user: JWTPayload, role: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Require admin role
 */
export function requireAdmin(user: JWTPayload): void {
  requireRole(user, UserRole.ADMIN);
}

/**
 * Require vendor role
 */
export function requireVendor(user: JWTPayload): void {
  requireRole(user, UserRole.VENDOR);
}

/**
 * Require NGO role
 */
export function requireNGO(user: JWTPayload): void {
  requireRole(user, UserRole.NGO);
}

/**
 * Require admin or specific user
 */
export function requireAdminOrOwner(user: JWTPayload, resourceOwnerId: number): void {
  if (user.role !== UserRole.ADMIN && user.userId !== resourceOwnerId) {
    throw new AuthorizationError('You can only access your own resources.');
  }
}

/**
 * Optional authentication (doesn't throw if no token)
 */
export function optionalAuth(request: NextRequest): JWTPayload | null {
  try {
    return authenticateRequest(request);
  } catch {
    return null;
  }
}

/**
 * Create authentication context for API routes
 */
export interface AuthContext {
  user: JWTPayload;
  requireRole: (role: UserRole | UserRole[]) => void;
  requireAdmin: () => void;
  requireVendor: () => void;
  requireNGO: () => void;
  requireOwner: (resourceOwnerId: number) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
  isVendor: boolean;
  isNGO: boolean;
  isDonor: boolean;
}

/**
 * Create authentication context from request
 */
export function createAuthContext(request: NextRequest): AuthContext {
  const user = authenticateRequest(request);

  return {
    user,
    requireRole: (role: UserRole | UserRole[]) => requireRole(user, role),
    requireAdmin: () => requireAdmin(user),
    requireVendor: () => requireVendor(user),
    requireNGO: () => requireNGO(user),
    requireOwner: (resourceOwnerId: number) => requireAdminOrOwner(user, resourceOwnerId),
    hasRole: (role: UserRole | UserRole[]) => hasRole(user, role),
    isAdmin: user.role === UserRole.ADMIN,
    isVendor: user.role === UserRole.VENDOR,
    isNGO: user.role === UserRole.NGO,
    isDonor: user.role === UserRole.DONOR,
  };
}

/**
 * Refresh token (generate new token with same payload but new expiry)
 */
export function refreshToken(token: string): string {
  const payload = verifyToken(token);
  
  // Remove iat and exp from payload
  const { iat, exp, ...userPayload } = payload;
  
  return generateToken(userPayload);
}

/**
 * Decode token without verification (use with caution)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired without throwing
 */
export function isTokenExpired(token: string): boolean {
  try {
    verifyToken(token);
    return false;
  } catch (error) {
    return error instanceof jwt.TokenExpiredError;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  
  return new Date(decoded.exp * 1000);
}
