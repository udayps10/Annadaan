import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get verification profile
    const verificationProfile = await executeQuery(
      'SELECT * FROM verification_profiles WHERE user_id = ?',
      [decoded.userId]
    ) as any[];

    // Get verification documents
    const documents = await executeQuery(
      'SELECT document_type, status, admin_notes, created_at, updated_at FROM verification_documents WHERE user_id = ?',
      [decoded.userId]
    ) as any[];

    // Get user details
    const user = await executeQuery(
      'SELECT id, name, full_name, email, role, status FROM users WHERE id = ?',
      [decoded.userId]
    ) as any[];

    if (user.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const userData = user[0];
    const profile = verificationProfile.length > 0 ? verificationProfile[0] : null;

    return NextResponse.json({
      user: userData,
      verificationProfile: profile,
      documents: documents,
      isVerified: userData.status === 'approved',
      canAccessDashboard: userData.status === 'approved'
    });

  } catch (error) {
    console.error('Verification status error:', error);
    return NextResponse.json({ message: 'Failed to get verification status' }, { status: 500 });
  }
}
