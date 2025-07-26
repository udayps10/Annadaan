import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

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

    let requests: any[] = [];

    if (decoded.role === 'ngo') {
      // NGOs should only see their own pickup requests
      requests = await executeQuery(`
        SELECT 
          pr.*,
          fl.title as listing_title,
          fl.quantity as listing_quantity,
          v.name as vendor_name
        FROM pickup_requests pr
        JOIN food_listings fl ON pr.listing_id = fl.id
        JOIN users v ON fl.vendor_id = v.id
        WHERE pr.ngo_id = ?
        ORDER BY pr.created_at DESC
      `, [decoded.userId]) as any[];

    } else if (decoded.role === 'vendor') {
      // Vendors should only see pickup requests for their own listings
      requests = await executeQuery(`
        SELECT 
          pr.*,
          fl.title as listing_title,
          fl.quantity as listing_quantity,
          u.name as ngo_name,
          np.organization_name
        FROM pickup_requests pr
        JOIN food_listings fl ON pr.listing_id = fl.id
        JOIN users u ON pr.ngo_id = u.id
        LEFT JOIN ngo_profiles np ON u.id = np.user_id
        WHERE fl.vendor_id = ?
        ORDER BY pr.created_at DESC
      `, [decoded.userId]) as any[];

    } else if (decoded.role === 'admin') {
      // Admins can see all pickup requests
      requests = await executeQuery(`
        SELECT 
          pr.*,
          fl.title as listing_title,
          fl.quantity as listing_quantity,
          u.name as ngo_name,
          np.organization_name,
          v.name as vendor_name
        FROM pickup_requests pr
        JOIN food_listings fl ON pr.listing_id = fl.id
        JOIN users u ON pr.ngo_id = u.id
        JOIN users v ON fl.vendor_id = v.id
        LEFT JOIN ngo_profiles np ON u.id = np.user_id
        ORDER BY pr.created_at DESC
      `) as any[];
    }

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Get pickup requests error:', error);
    return NextResponse.json({ message: 'Failed to fetch pickup requests' }, { status: 500 });
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
    
    if (!decoded || decoded.role !== 'ngo') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { listing_id, message, requested_pickup_time } = await request.json();

    const result = await executeQuery(
      `INSERT INTO pickup_requests (listing_id, ngo_id, message, requested_pickup_time) 
       VALUES (?, ?, ?, ?)`,
      [listing_id, decoded.userId, message || null, requested_pickup_time || null]
    ) as any;

    return NextResponse.json({
      message: 'Pickup request submitted successfully',
      requestId: result.insertId
    });

  } catch (error) {
    console.error('Create pickup request error:', error);
    return NextResponse.json({ message: 'Failed to create pickup request' }, { status: 500 });
  }
}
