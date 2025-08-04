import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

// Get document details for admin review
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
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

    const documentId = params.documentId;

    // Get document details with user information
    const documents = await executeQuery(`
      SELECT 
        vd.*,
        u.name,
        u.email,
        u.role
      FROM verification_documents vd
      JOIN users u ON vd.user_id = u.id
      WHERE vd.id = ?
    `, [documentId]) as any[];

    if (documents.length === 0) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    const document = documents[0];

    return NextResponse.json({
      message: 'Document retrieved successfully',
      document
    });

  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json({ message: 'Failed to get document' }, { status: 500 });
  }
}

// Update individual document status
export async function PUT(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
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

    const documentId = params.documentId;
    const { status, adminNotes } = await request.json();

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ 
        message: 'Valid status (approved/rejected/pending) is required' 
      }, { status: 400 });
    }

    const adminId = decoded.userId;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update document status
    await executeQuery(
      'UPDATE verification_documents SET status = ?, admin_notes = ?, reviewed_by = ?, reviewed_at = ? WHERE id = ?',
      [status, adminNotes || null, adminId, now, documentId]
    );

    return NextResponse.json({
      message: 'Document status updated successfully',
      documentId,
      status
    });

  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json({ message: 'Failed to update document status' }, { status: 500 });
  }
}
