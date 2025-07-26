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
    
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Read the request body ONCE and store it
    const requestBody = await request.json();
    const { status, vendor_response, pickup_photo_url, pickup_photo_filename, pickup_notes } = requestBody;
    const requestId = params.id;

    // Vendors can approve/reject requests, NGOs can mark as completed
    if (decoded.role === 'vendor' && (status === 'approved' || status === 'rejected')) {
      // Update the pickup request status and response
      await executeQuery(
        `UPDATE pickup_requests 
         SET status = ?, vendor_response = ?, updated_at = NOW() 
         WHERE id = ?`,
        [status, vendor_response || null, requestId]
      );

      // If approved, update the listing status to reserved
      if (status === 'approved') {
        await executeQuery(
          `UPDATE food_listings fl 
           JOIN pickup_requests pr ON fl.id = pr.listing_id 
           SET fl.status = 'reserved' 
           WHERE pr.id = ?`,
          [requestId]
        );
      }

      return NextResponse.json({
        message: `Request ${status} successfully`
      });

    } else if (decoded.role === 'ngo' && status === 'completed') {
      // NGO marking pickup as completed with photo verification

      // Photo is mandatory for completing pickup
      if (!pickup_photo_url) {
        return NextResponse.json({ 
          message: 'Photo verification is required to complete pickup' 
        }, { status: 400 });
      }

      await executeQuery(
        `UPDATE pickup_requests 
         SET status = 'completed', pickup_photo_url = ?, pickup_photo_filename = ?, pickup_notes = ?, updated_at = NOW() 
         WHERE id = ? AND ngo_id = ?`,
        [pickup_photo_url, pickup_photo_filename || null, pickup_notes || null, requestId, decoded.userId]
      );

      // Update the listing status to picked_up
      await executeQuery(
        `UPDATE food_listings fl 
         JOIN pickup_requests pr ON fl.id = pr.listing_id 
         SET fl.status = 'picked_up' 
         WHERE pr.id = ?`,
        [requestId]
      );

      return NextResponse.json({
        message: 'Pickup marked as completed successfully with photo verification'
      });

    } else {
      return NextResponse.json({ message: 'Unauthorized action' }, { status: 403 });
    }

  } catch (error) {
    console.error('Update pickup request error:', error);
    return NextResponse.json({ message: 'Failed to update pickup request' }, { status: 500 });
  }
}
