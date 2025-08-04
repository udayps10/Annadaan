import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    // Check for token in query params as well as headers (for browser navigation)
    const authHeader = request.headers.get('authorization');
    const tokenFromQuery = request.nextUrl.searchParams.get('token');
    
    let token = null;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (tokenFromQuery) {
      token = tokenFromQuery;
    }

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const documentId = params.documentId;

    // Get document data
    const documents = await executeQuery(
      'SELECT document_url, document_filename, document_type FROM verification_documents WHERE id = ?',
      [documentId]
    ) as any[];

    if (documents.length === 0) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    const document = documents[0];

    // Extract the base64 data and mime type from the data URL
    const dataUrl = document.document_url;
    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return NextResponse.json({ message: 'Invalid document format' }, { status: 400 });
    }

    // Parse the data URL (format: data:mime/type;base64,actualdata)
    const [mimeInfo, base64Data] = dataUrl.split(',');
    const mimeType = mimeInfo.split(';')[0].split(':')[1];

    if (!base64Data) {
      return NextResponse.json({ message: 'Invalid document data' }, { status: 400 });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Return the file with appropriate headers for viewing in browser
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${document.document_filename}"`,
        'Cache-Control': 'private, no-cache',
      },
    });

  } catch (error) {
    console.error('Document view error:', error);
    return NextResponse.json({ message: 'Failed to view document' }, { status: 500 });
  }
}
