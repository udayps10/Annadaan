import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get all approved and public impact photos for the gallery
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
      WHERE ip.is_approved = true AND ip.is_public = true
      ORDER BY ip.created_at DESC
    `);

    return NextResponse.json({ photos: result });
  } catch (error) {
    console.error('Get gallery photos error:', error);
    return NextResponse.json({ message: 'Failed to fetch gallery photos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { title, description, location, peopleHelped, tags, photoUrl, photoFilename } = await request.json();

    if (!title || !description || !photoUrl) {
      return NextResponse.json({ message: 'Title, description, and photo are required' }, { status: 400 });
    }

    const result = await executeQuery(
      `INSERT INTO impact_photos 
       (user_id, title, description, location, photo_url, photo_filename, people_helped, tags, date_shared, is_approved, is_public) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), false, true)`,
      [
        decoded.userId, 
        title, 
        description, 
        location || '', 
        photoUrl, 
        photoFilename || '',
        peopleHelped || 0,
        tags ? JSON.stringify(tags) : '[]'
      ]
    ) as any;

    return NextResponse.json({
      message: 'Impact photo uploaded successfully! It will be visible after admin approval.',
      photoId: result.insertId
    });
  } catch (error) {
    console.error('Upload impact photo error:', error);
    return NextResponse.json({ message: 'Failed to upload impact photo' }, { status: 500 });
  }
}
