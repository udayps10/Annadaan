import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { executeQuery } from '@/lib/database';
import { readFile } from 'fs/promises';
import path from 'path';

// View/download document file
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string; action: string } }
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

    const { documentId, action } = params;

    if (action !== 'view' && action !== 'download') {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    // Get document details
    const documents = await executeQuery(`
      SELECT * FROM verification_documents WHERE id = ?
    `, [documentId]) as any[];

    if (documents.length === 0) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    const document = documents[0];
    
    // Try to read file from filesystem first
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    const filePath = path.join(uploadsDir, document.file_path);
    
    try {
      const fileBuffer = await readFile(filePath);
      const mimeType = document.file_type || 'application/octet-stream';
      
      const headers: Record<string, string> = {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
      };

      if (action === 'download') {
        headers['Content-Disposition'] = `attachment; filename="${document.document_type}_${document.id}.${document.file_path.split('.').pop()}"`;
      } else {
        headers['Content-Disposition'] = 'inline';
      }

      return new NextResponse(fileBuffer, { headers });
      
    } catch (fileError) {
      // If file not found on filesystem, try to serve from base64 data
      if (document.file_data) {
        // Remove data URL prefix if present
        const base64Data = document.file_data.replace(/^data:[^;]+;base64,/, '');
        const fileBuffer = Buffer.from(base64Data, 'base64');
        const mimeType = document.file_type || 'application/octet-stream';
        
        const headers: Record<string, string> = {
          'Content-Type': mimeType,
          'Content-Length': fileBuffer.length.toString(),
        };

        if (action === 'download') {
          headers['Content-Disposition'] = `attachment; filename="${document.document_type}_${document.id}.${document.file_type?.split('/')[1] || 'bin'}"`;
        } else {
          headers['Content-Disposition'] = 'inline';
        }

        return new NextResponse(fileBuffer, { headers });
      }
      
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('View document error:', error);
    return NextResponse.json({ message: 'Failed to view document' }, { status: 500 });
  }
}
