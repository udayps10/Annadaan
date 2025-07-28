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
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get all impact photos for admin review
    const result = await executeQuery(`
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
    `);

    return NextResponse.json({ photos: result });
  } catch (error) {
    console.error('Get admin gallery photos error:', error);
    return NextResponse.json({ message: 'Failed to fetch gallery photos' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { photoId, action } = await request.json();

    if (!photoId || !action) {
      return NextResponse.json({ message: 'Photo ID and action are required' }, { status: 400 });
    }

    if (action === 'approve') {
      await executeQuery(
        `UPDATE impact_photos SET is_approved = true, updated_at = NOW() WHERE id = ?`,
        [photoId]
      );
      return NextResponse.json({ message: 'Photo approved successfully' });
    } else if (action === 'reject') {
      await executeQuery(
        `DELETE FROM impact_photos WHERE id = ?`,
        [photoId]
      );
      return NextResponse.json({ message: 'Photo rejected and removed successfully' });
    } else if (action === 'toggle_public') {
      await executeQuery(
        `UPDATE impact_photos SET is_public = NOT is_public, updated_at = NOW() WHERE id = ?`,
        [photoId]
      );
      return NextResponse.json({ message: 'Photo visibility toggled successfully' });
    } else {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin gallery action error:', error);
    return NextResponse.json({ message: 'Failed to perform action' }, { status: 500 });
  }
}
