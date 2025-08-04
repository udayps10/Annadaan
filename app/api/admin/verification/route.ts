import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

// Get all pending verifications
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

        // Get all pending verification users with their profiles
    const users = await executeQuery(`
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
    `) as any[];

    // Get documents for each user
    const usersWithDocuments = await Promise.all(
      users.map(async (user) => {
        const documents = await executeQuery(
          'SELECT id, document_type, status, document_filename, admin_notes, created_at, updated_at FROM verification_documents WHERE user_id = ?',
          [user.id]
        ) as any[];

        return {
          ...user,
          documents
        };
      })
    );

    return NextResponse.json({
      message: 'Pending verifications retrieved successfully',
      users: usersWithDocuments
    });

  } catch (error) {
    console.error('Get verifications error:', error);
    return NextResponse.json({ message: 'Failed to get verifications' }, { status: 500 });
  }
}

// Approve or reject user verification
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { userId, action, notes, rejectionReason } = await request.json();

    if (!userId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ 
        message: 'User ID and valid action (approve/reject) are required' 
      }, { status: 400 });
    }

    const adminId = decoded.userId;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (action === 'approve') {
      // Update user status to approved
      await executeQuery(
        'UPDATE users SET status = ? WHERE id = ?',
        ['approved', userId]
      );

      // Update verification profile
      await executeQuery(
        'UPDATE verification_profiles SET verification_status = ?, reviewed_by = ?, reviewed_at = ?, approved_at = ?, verification_notes = ? WHERE user_id = ?',
        ['approved', adminId, now, now, notes || 'Verification approved', userId]
      );

      // Update all documents to approved
      await executeQuery(
        'UPDATE verification_documents SET status = ?, reviewed_by = ?, reviewed_at = ?, admin_notes = ? WHERE user_id = ?',
        ['approved', adminId, now, notes || 'Documents approved', userId]
      );

    } else if (action === 'reject') {
      // Update user status to rejected
      await executeQuery(
        'UPDATE users SET status = ? WHERE id = ?',
        ['rejected', userId]
      );

      // Update verification profile
      await executeQuery(
        'UPDATE verification_profiles SET verification_status = ?, reviewed_by = ?, reviewed_at = ?, rejection_reason = ?, verification_notes = ? WHERE user_id = ?',
        ['rejected', adminId, now, rejectionReason || 'Verification rejected', notes || 'Verification rejected', userId]
      );

      // Update all documents to rejected
      await executeQuery(
        'UPDATE verification_documents SET status = ?, reviewed_by = ?, reviewed_at = ?, admin_notes = ? WHERE user_id = ?',
        ['rejected', adminId, now, rejectionReason || 'Documents rejected', userId]
      );
    }

    return NextResponse.json({
      message: `User verification ${action}d successfully`,
      action,
      userId
    });

  } catch (error) {
    console.error('Verification action error:', error);
    return NextResponse.json({ message: 'Failed to update verification status' }, { status: 500 });
  }
}
