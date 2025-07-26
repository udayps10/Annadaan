import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let listings: any[] = [];

    if (!authHeader?.startsWith('Bearer ')) {
      // If no auth header, return only available listings (for public access)
      listings = await executeQuery(`
        SELECT 
          fl.*,
          u.name as vendor_name,
          vp.business_name
        FROM food_listings fl
        JOIN users u ON fl.vendor_id = u.id
        LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
        WHERE fl.status = 'available'
        ORDER BY fl.created_at DESC
      `) as any[];
    } else {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }

      if (decoded.role === 'vendor') {
        // Vendors should see only their own listings
        listings = await executeQuery(`
          SELECT 
            fl.*,
            u.name as vendor_name,
            vp.business_name
          FROM food_listings fl
          JOIN users u ON fl.vendor_id = u.id
          LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
          WHERE fl.vendor_id = ?
          ORDER BY fl.created_at DESC
        `, [decoded.userId]) as any[];
      } else if (decoded.role === 'ngo') {
        // NGOs should see only available listings from all vendors
        listings = await executeQuery(`
          SELECT 
            fl.*,
            u.name as vendor_name,
            vp.business_name
          FROM food_listings fl
          JOIN users u ON fl.vendor_id = u.id
          LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
          WHERE fl.status = 'available'
          ORDER BY fl.created_at DESC
        `) as any[];
      } else if (decoded.role === 'admin') {
        // Admins can see all listings
        listings = await executeQuery(`
          SELECT 
            fl.*,
            u.name as vendor_name,
            vp.business_name
          FROM food_listings fl
          JOIN users u ON fl.vendor_id = u.id
          LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
          ORDER BY fl.created_at DESC
        `) as any[];
      }
    }

    return NextResponse.json({ listings });
  } catch (error) {
    console.error('Get listings error:', error);
    return NextResponse.json({ message: 'Failed to fetch listings' }, { status: 500 });
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
    
    if (!decoded || decoded.role !== 'vendor') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, food_type, quantity, expiry_date, pickup_location, contact_info } = await request.json();

    const result = await executeQuery(
      `INSERT INTO food_listings 
       (vendor_id, title, description, food_type, quantity, expiry_date, pickup_location, contact_info) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [decoded.userId, title, description, food_type, quantity, expiry_date, pickup_location, contact_info]
    ) as any;

    return NextResponse.json({
      message: 'Listing created successfully',
      listingId: result.insertId
    });

  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json({ message: 'Failed to create listing' }, { status: 500 });
  }
}
