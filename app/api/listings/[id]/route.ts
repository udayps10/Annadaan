import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/database';
import { verifyToken } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status } = await request.json();
    const listingId = params.id;

    // First check if the listing exists and its current status
    const currentListing = await executeQuery(
      `SELECT status FROM food_listings WHERE id = ? AND vendor_id = ?`,
      [listingId, decoded.userId]
    ) as any[];

    if (currentListing.length === 0) {
      return NextResponse.json({ message: 'Listing not found or unauthorized' }, { status: 404 });
    }

    // Prevent updating listings that have been picked up (completed orders)
    if (currentListing[0].status === 'picked_up') {
      return NextResponse.json({ 
        message: 'Cannot modify completed orders. This listing has already been picked up and delivered.' 
      }, { status: 400 });
    }

    // Only allow vendors to mark their own listings as available/expired
    const result = await executeQuery(
      `UPDATE food_listings 
       SET status = ?, updated_at = NOW() 
       WHERE id = ? AND vendor_id = ?`,
      [status, listingId, decoded.userId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'Failed to update listing' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Listing status updated to ${status} successfully`
    });

  } catch (error) {
    console.error('Update listing error:', error);
    return NextResponse.json({ message: 'Failed to update listing' }, { status: 500 });
  }
}
