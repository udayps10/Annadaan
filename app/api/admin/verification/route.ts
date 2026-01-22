import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeInTransaction } from '@/lib/database';
import { createAuthContext } from '@/lib/middleware';
import { handleError, handleSuccess } from '@/lib/errors';
import { validateFields, validateEnum, validateRequired, parseInteger } from '@/lib/validation';
import { logInfo } from '@/lib/logger';

interface VerificationUser {
  id: number
  name: string
  full_name: string
  email: string
  phone: string
  role: string
  address: string
  status: string
  created_at: Date
  verification_status: string | null
  admin_notes: string | null
  reviewed_by: number | null
  reviewed_at: Date | null
  business_name?: string
  business_type?: string
  business_description?: string
  website?: string
  average_daily_available?: number
  organization_name?: string
  registration_number?: string
  focus_area?: string
  capacity?: number
  service_area_radius?: number
  organization_description?: string
}

interface VerificationDocument {
  id: number
  document_type: string
  status: string
  document_filename: string
  admin_notes: string | null
  created_at: Date
  updated_at: Date
}

const ALLOWED_ACTIONS = ['approve', 'reject'] as const

// Get all pending verifications
export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = createAuthContext(request)
    auth.requireAdmin()

    // Get all pending verification users with their profiles
    const users = await executeQuery<VerificationUser[]>(`
      SELECT 
        u.id,
        u.name,
        u.full_name,
        u.email,
        u.phone,
        u.role,
        u.address,
        u.status,
        u.created_at,
        vp.verification_status,
        vp.verification_notes as admin_notes,
        vp.reviewed_by,
        vp.reviewed_at,
        v.business_name,
        v.business_type,
        v.description as business_description,
        v.website,
        v.average_daily_available,
        n.organization_name,
        n.registration_number,
        n.focus_area,
        n.capacity,
        n.service_area_radius,
        n.description as organization_description
      FROM users u
      LEFT JOIN verification_profiles vp ON u.id = vp.user_id
      LEFT JOIN vendor_profiles v ON u.id = v.user_id AND u.role = 'vendor'
      LEFT JOIN ngo_profiles n ON u.id = n.user_id AND u.role = 'ngo'
      WHERE u.status = 'pending'
      ORDER BY u.created_at DESC
    `)

    // Get documents for each user
    const usersWithDocuments = await Promise.all(
      users.map(async (user) => {
        const documents = await executeQuery<VerificationDocument[]>(
          'SELECT id, document_type, status, document_filename, admin_notes, created_at, updated_at FROM verification_documents WHERE user_id = ?',
          [user.id]
        )

        return {
          ...user,
          documents
        }
      })
    )

    return handleSuccess({
      users: usersWithDocuments
    }, 'Pending verifications retrieved successfully')

  } catch (error) {
    return handleError(error as Error)
  }
}

// Approve or reject user verification
export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = createAuthContext(request)
    auth.requireAdmin()

    const { userId, action, notes, rejectionReason } = await request.json()

    // Validate inputs
    validateFields([
      { result: validateRequired(userId, 'User ID'), field: 'userId' },
      { result: validateRequired(action, 'Action'), field: 'action' },
      { result: validateEnum(action, ALLOWED_ACTIONS), field: 'action' }
    ])

    const validatedUserId = parseInteger(userId, 'User ID')
    const adminId = auth.user.userId
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

    // Execute all updates in a transaction for data consistency
    await executeInTransaction(async (connection) => {
      if (action === 'approve') {
        // Update user status to approved
        await connection.execute(
          'UPDATE users SET status = ? WHERE id = ?',
          ['approved', validatedUserId]
        )

        // Update verification profile
        await connection.execute(
          'UPDATE verification_profiles SET verification_status = ?, reviewed_by = ?, reviewed_at = ?, approved_at = ?, verification_notes = ? WHERE user_id = ?',
          ['approved', adminId, now, now, notes || 'Verification approved', validatedUserId]
        )

        // Update all documents to approved
        await connection.execute(
          'UPDATE verification_documents SET status = ?, reviewed_by = ?, reviewed_at = ?, admin_notes = ? WHERE user_id = ?',
          ['approved', adminId, now, notes || 'Documents approved', validatedUserId]
        )
      } else {
        // Update user status to rejected
        await connection.execute(
          'UPDATE users SET status = ? WHERE id = ?',
          ['rejected', validatedUserId]
        )

        // Update verification profile
        await connection.execute(
          'UPDATE verification_profiles SET verification_status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ?, verification_notes = ? WHERE user_id = ?',
          ['rejected', adminId, now, rejectionReason || 'Verification rejected', notes || 'Verification rejected', validatedUserId]
        )

        // Update all documents to rejected
        await connection.execute(
          'UPDATE verification_documents SET status = ?, reviewed_by = ?, reviewed_at = ?, admin_notes = ? WHERE user_id = ?',
          ['rejected', adminId, now, rejectionReason || 'Documents rejected', validatedUserId]
        )
      }
    })

    logInfo(`User verification ${action}d successfully`, { userId: validatedUserId, action, adminId })

    return handleSuccess(
      { action, userId: validatedUserId },
      `User verification ${action}d successfully`
    )

  } catch (error) {
    return handleError(error as Error)
  }
}
