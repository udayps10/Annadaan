import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { createAuthContext } from '@/lib/middleware';
import { handleError, handleSuccess } from '@/lib/errors';
import { validateFields, validateEnum, validateRequired, parseInteger } from '@/lib/validation';
import { logInfo } from '@/lib/logger';

interface ImpactPhoto {
  id: number
  userId: number
  title: string
  description: string | null
  location: string | null
  photoUrl: string
  photoFilename: string
  peopleHelped: number | null
  tags: string | null
  dateShared: Date
  isApproved: boolean
  isPublic: boolean
  likes: number
  createdAt: Date
  updatedAt: Date
  userFullName: string
  userType: string
  organizationName: string | null
}

const ALLOWED_ACTIONS = ['approve', 'reject', 'toggle_public'] as const

export async function GET(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = createAuthContext(request)
    auth.requireAdmin()

    // Get all impact photos for admin review
    const photos = await executeQuery<ImpactPhoto[]>(`
      SELECT 
        ip.id,
        ip.user_id as userId,
        ip.title,
        ip.description,
        ip.location,
        ip.photo_url as photoUrl,
        ip.photo_filename as photoFilename,
        ip.people_helped as peopleHelped,
        ip.tags,
        ip.date_shared as dateShared,
        ip.is_approved as isApproved,
        ip.is_public as isPublic,
        ip.likes,
        ip.created_at as createdAt,
        ip.updated_at as updatedAt,
        u.name as userFullName,
        u.role as userType,
        COALESCE(vp.business_name, np.organization_name) as organizationName
      FROM impact_photos ip
      JOIN users u ON ip.user_id = u.id
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id AND u.role = 'vendor'
      LEFT JOIN ngo_profiles np ON u.id = np.user_id AND u.role = 'ngo'
      ORDER BY ip.created_at DESC
    `)

    return handleSuccess({ photos })
  } catch (error) {
    return handleError(error as Error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate admin
    const auth = createAuthContext(request)
    auth.requireAdmin()

    const { photoId, action } = await request.json()

    // Validate inputs
    validateFields([
      { result: validateRequired(photoId, 'Photo ID'), field: 'photoId' },
      { result: validateRequired(action, 'Action'), field: 'action' },
      { result: validateEnum(action, ALLOWED_ACTIONS), field: 'action' }
    ])

    const validatedPhotoId = parseInteger(photoId, 'Photo ID')

    if (action === 'approve') {
      await executeQuery(
        `UPDATE impact_photos SET is_approved = true, updated_at = NOW() WHERE id = ?`,
        [validatedPhotoId]
      )
      logInfo('Photo approved', { photoId: validatedPhotoId, adminId: auth.user.userId })
      return handleSuccess(null, 'Photo approved successfully')
    } else if (action === 'reject') {
      await executeQuery(
        `DELETE FROM impact_photos WHERE id = ?`,
        [validatedPhotoId]
      )
      logInfo('Photo rejected and removed', { photoId: validatedPhotoId, adminId: auth.user.userId })
      return handleSuccess(null, 'Photo rejected and removed successfully')
    } else {
      await executeQuery(
        `UPDATE impact_photos SET is_public = NOT is_public, updated_at = NOW() WHERE id = ?`,
        [validatedPhotoId]
      )
      logInfo('Photo visibility toggled', { photoId: validatedPhotoId, adminId: auth.user.userId })
      return handleSuccess(null, 'Photo visibility toggled successfully')
    }
  } catch (error) {
    return handleError(error as Error)
  }
}
